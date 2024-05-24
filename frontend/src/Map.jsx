import { useEffect, useState, useRef } from "react";

// Custom Hooks
import { useMap } from "./hooks/useMap";
import "./App.css"
import { init_viewport } from "./data/startup_data";

import ClassyList, { CategoricalClassyList } from "./components/classyList/classyList";
import Menu from "./components/menu/menu";
import DataView from "./components/dataView/dataView";

const token =
  "pk.eyJ1IjoiY2xvd3JpZSIsImEiOiJja21wMHpnMnIwYzM5Mm90OWFqaTlyejhuIn0.TXE-FIaqF4K_K1OirvD0wQ";

function JSON_Parse(obj) {
  const to_return = Object()
  Object.keys(obj).forEach(k => {
    let v = obj[k];
    try {
      v = JSON.parse(v)
    }
    catch {

    }
    to_return[k] = v
  })
  return to_return
}

function CreateGeojsonFromResponse(data) {

  const getText = (f) => {
    if (Object.keys(f).includes('plain_text')) {
      return f.plain_text
    }
    if (Object.keys(f).includes('number')) {
      return f.number
    }
    if (Object.keys(f).includes('url')) {
      return f.url
    }
    if (Object.keys(f).includes('name')) {
      return f.name
    }
    return f
  }

  const multiSelectFix = (d) => {
    const field = Object.keys(d).filter(k => !['id', 'type'].includes(k))
    if (d[field] === 0) return getText(d[field])
    if (!d[field]) return null
    if (Array.isArray(d[field])) {
      const x = d[field].map(i => getText(i))
      if (x.length === 1) return x[0]
      return x
    }
    return getText(d[field])
  }

  return data.map((d, idx) => {
    try {

      const to_return = Object()
      to_return['geometry'] = {
        "type": "Point",
        "coordinates": [
          Number(d.properties.Longitude.number),
          Number(d.properties.Latitude.number)
        ]
      }
      const properties = Object.keys(d.properties).map(k => {
        const props = Object()
        let v = multiSelectFix(d.properties[k])
        if (["Authors", "Institutions"].includes(k) && !Array.isArray(v)) v = [v]
        props[k] = v
        return props
      })
      const result = properties.reduce((acc, curr) => Object.assign(acc, curr), {});
      to_return['properties'] = result
      to_return['properties']['color'] = d.properties.Topic.multi_select[0].color
      to_return['type'] = 'Feature'
      to_return['id'] = idx
      return to_return
    }
    catch {
      return
    }
  }).filter(d => d)
}

export default function Map() {

  const { map, mapContainer, mapLoaded, viewport, flyToViewport, flyToBounds } =
    useMap(init_viewport, token, "mapbox://styles/mapbox/light-v11");


  const [features, setFeatures] = useState([])
  const [data, setData] = useState()
  const [video, setVideo] = useState()
  const [callouts, setCallouts] = useState([])
  const canvasRef = useRef()

  const BL_Callout = useRef()
  const TR_Callout = useRef()

  const initialSpinTimeout = useRef()

  const callout_offsets = {
    x: 20,
    y: 50
  }

  function AddData(map) {
    const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/v1/databases/${import.meta.env.VITE_APP_DATABASE_ID}/query`
    fetch(URL, {
      method: "POST"
    })
      .then(r => r.json())
      .then(r => {
        console.log(r)

        const features = CreateGeojsonFromResponse(r.results)

        const geojson = {
          type: "FeatureCollection",
          features: features
        }
        setFeatures(features)
        map.addLayer({
          'id': 'data',
          'type': 'circle',
          'source': {
            type: 'geojson',
            data: geojson
          },
          'paint': {
            'circle-color': ['get', 'color']
          }
        });
        map.on('click', 'data', (e) => setData(JSON_Parse(e.features[0].properties)))
        map.on('move', () => {

          let width = map.getCanvas().clientWidth;
          let height = map.getCanvas().clientHeight;

          let center = {
            x: width / 2,
            y: height / 2
          }

          let features = map.queryRenderedFeatures({ layers: ["data"] }).map(f => {
            try {
              f['pos'] = map.project([f.properties.Longitude, f.properties.Latitude])
            }
            catch {
              console.log("ERROR")
              console.log(f)
              f['pos'] = { x: 1000000, y: 1000000 }
            }
            f['distance_to_corners'] = Object()
            f['distance_to_corners'].bottom_left = (height - f['pos'].y + f['pos'].x)
            f['distance_to_corners'].top_right = (f['pos'].y + width - f['pos'].x)
            f['distance_to_center'] = Math.sqrt(
              Math.pow(f['pos'].y - center.y, 2) +
              Math.pow(f['pos'].x - center.x, 2)
            )
            return f
          })

          if (features.length < 2) {
            setCallouts([])
            const ctx = canvasRef.current.getContext('2d');
            let width = map.getCanvas().clientWidth;
            let height = map.getCanvas().clientHeight;
            ctx.clearRect(0, 0, width, height);
            return
          }

          // const f1 = features.sort(function (a, b) {
          //   return a.distance_to_corners.bottom_left - b.distance_to_corners.bottom_left;
          // })[0]

          // const f2 = features.sort(function (a, b) {
          //   return a.distance_to_corners.top_right - b.distance_to_corners.top_right;
          // })[0]

          const f1 = features.sort(function (a, b) {
            return a.distance_to_center - b.distance_to_center;
          })[0]

          const _callouts = [
            {
              loc: "bottom_left",
              data: f1,
              ref: BL_Callout
            },
            // {
            //   loc: "top_right",
            //   data: f2,
            //   ref: TR_Callout
            // },
          ]
          setCallouts(_callouts)
        })
      })
  }

  useEffect(() => {
    if (!map) return
    map.on('load', () => {
      AddData(map)
    })
    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
      });
    });
  }, [map])

  useEffect(() => {
    if (!map) return
    map.on('load', () => {
      AddData(map)
    })
    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
      });
    });
  }, [map])

  useEffect(() => {
    if (callouts.length === 0) return

    const ctx = canvasRef.current.getContext('2d');
    let width = map.getCanvas().clientWidth;
    let height = map.getCanvas().clientHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    ctx.clearRect(0, 0, width, height);

    // Function to draw a line
    function drawLine(x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'grey'; // You can change the color here
      ctx.lineWidth = 1; // You can change the line width here
      ctx.stroke();
    }

    const bl = callouts.filter(c => c.loc === "bottom_left")[0]
    // const tr = callouts.filter(c => c.loc === "top_right")[0]
    drawLine(
      bl.data.pos.x,
      bl.data.pos.y,
      bl.data.pos.x - callout_offsets.x,
      bl.data.pos.y + callout_offsets.y,
    )
    // drawLine(
    //   tr.data.pos.x,
    //   tr.data.pos.y,
    //   tr.data.pos.x + callout_offsets.x,
    //   tr.data.pos.y - callout_offsets.y,
    // )
  }, [callouts])

  useEffect(() => {
    if (!data) return
    console.log(data)
    console.log({ center: [data.Longitude, data.Latitude] })
    console.log(map)
    map.flyTo(
      {
        center: [data.Longitude, data.Latitude],
        essential: true,
        zoom: 4
      },
    )
    clearInterval(initialSpinTimeout.current)
  }, [data, map])

  // Initial Spin
  useEffect(() => {
    if (!mapLoaded) return
    initialSpinTimeout.current = setInterval(() => {
      const { lng, lat } = map.getCenter()
      map.flyTo({ center: [lng + .04, lat], essential: true })
    }, 5)
    map.on("mousedown", () => clearInterval(initialSpinTimeout.current))
  }, [map, mapLoaded])

  const header = data ?
    <div className="header" onClick={() => setData()}>
      <div className='back-arrow-container'>
        <div className='back-arrow' />
      </div>
      <div className="text">Back To Project List</div>
    </div> :
    <div className="header" onClick={() => setData()}>
      <div className='title'>
        <span className='title1'>ECO</span>
        <span className='title2'>VIZ</span>
        <span className='title3'>{" Explorer"}</span>
      </div>
    </div>

  return (
    <div className="screen">
      {
        <Menu
          header={header}
          children={
            data ?
              <DataView data={data} /> :
              <CategoricalClassyList
                data={features}
                display_property={(d) => d.properties.Title}
                category_property={(d) => d.properties.Topic}
                classes={['video-popup']}
                itemClass={(d) => d.properties.Topic.split(' ').join('-')}
                itemOnClick={(d) => {
                  setData(d.properties)
                }}
              />}
        >
        </Menu>
      }
      <div className="canvas-container">
        <canvas id="canvasID" ref={canvasRef}>Canvas not supported</canvas>
        <div
          ref={mapContainer}
          className="map-container"
        />
        {
          callouts.map(c => <div className={"callout-container " + c.loc} ref={c.ref}
            style={{
              position: "absolute",
              left: canvasRef.current.getBoundingClientRect().left,
              right: canvasRef.current.getBoundingClientRect().right,
              top: canvasRef.current.getBoundingClientRect().top,
              bottom: canvasRef.current.getBoundingClientRect().bottom,
            }}>
            <div className="callout" style={{
              position: "relative",
              left: c.data.pos.x + (c.loc === "bottom_left" ? -callout_offsets.x - 50 : callout_offsets.x),
              top: c.data.pos.y + (c.loc === "top_right" ? -callout_offsets.y - 50 : callout_offsets.y),
              width: 150
            }}
              onClick={() => setData(JSON_Parse(c.data.properties))}
            >
              {c.data.properties.Title}
            </div>
          </div>)
        }
      </div>
    </div>
  );
}
