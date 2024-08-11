import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";

// Custom Hooks
import { useMap } from "./hooks/useMap";
import "./App.css";
import { init_viewport } from "./data/startup_data";

import { CategoricalClassyList } from "./components/classyList/classyList";
import Menu from "./components/menu/menu";
import DataView, { DetailDemo } from "./components/dataView/dataView";
import { ProjectsIntroduction } from "./components/projects-introduction/projects-introduction";

import earthGraphic from "./assets/earth_graphic.png";

const token =
  "pk.eyJ1IjoiamtlbmRhbGxiYXIiLCJhIjoiY2x3aXJtdndlMHQ2ODJpbGV2MHZuczJ6ZSJ9.Osr0UL8698r-LhyuBIXSog";

function JSON_Parse(obj) {
  const to_return = Object();
  Object.keys(obj).forEach((k) => {
    let v = obj[k];
    try {
      v = JSON.parse(v);
    } catch (e) {
      console.log(e);
    }
    to_return[k] = v;
  });
  return to_return;
}

const getText = (f) => {
  if (Object.keys(f).includes("plain_text")) {
    return f.plain_text;
  }
  if (Object.keys(f).includes("number")) {
    return f.number;
  }
  if (Object.keys(f).includes("url")) {
    return f.url;
  }
  if (Object.keys(f).includes("file")) {
    return f.file.url;
  }
  if (Object.keys(f).includes("name")) {
    return f.name;
  }
  return f;
};

const multiSelectFix = (d) => {
  const field = Object.keys(d).filter((k) => !["id", "type"].includes(k));
  if (d[field] === 0) return getText(d[field]);
  if (!d[field]) return null;
  if (Array.isArray(d[field])) {
    const x = d[field].map((i) => getText(i));
    if (x.length === 1) return x[0];
    return x;
  }
  return getText(d[field]);
};

function createGeojsonFromResponse(data) {
  return data
    .map((d, idx) => {
      try {
        const geometry = {
          type: "Point",
          coordinates: [
            Number(d.properties.Longitude.number),
            Number(d.properties.Latitude.number),
          ],
        };

        const properties = Object.keys(d.properties).reduce((acc, k) => {
          let value = multiSelectFix(d.properties[k]);
          if (
            ["Authors", "Institutions"].includes(k) &&
            !Array.isArray(value)
          ) {
            value = [value];
          }
          acc[k] = value;
          return acc;
        }, {});

        properties.color = d.properties.Topic.multi_select[0].color;

        return {
          type: "Feature",
          id: idx,
          geometry,
          properties,
        };
      } catch {
        return null;
      }
    })
    .filter((d) => d !== null);
}

const fetchProjectData = async () => {
  const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/v1/databases/${
    import.meta.env.VITE_APP_PROJECT_DATABASE_ID
  }/query`;
  const r = await fetch(URL, { method: "POST" });
  return r.json();
};

const formatUseCases = (useCases) => {
  return useCases.map((useCase) => ({
    affliation:
      useCase.properties["Project Lead Affiliation"].rich_text[0].plain_text,
    title: useCase.properties["Project Title"].rich_text[0].plain_text,
    funding: useCase.properties["Funding"].multi_select.map((s) => s.name),
    description: useCase.properties["Description"].rich_text[0].plain_text,
    visualizationTeam: useCase.properties[
      "Visualization Team"
    ].multi_select.map((s) => s.name),
    visualizationProjectLead:
      useCase.properties["Visualization Project Lead"].title[0].plain_text,
    logo: useCase.properties["Logo"].files[0].file.url,
    thumbnail: useCase.properties["Thumbnail"].files[0].file.url,
  }));
};

const getUseCases = async () => {
  const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/v1/databases/${
    import.meta.env.VITE_APP_USE_CASE_DATABASE_ID
  }/query`;
  const r = await fetch(URL, { method: "POST" });
  return formatUseCases((await r.json()).results);
};

const callout_offsets = {
  x: 20,
  y: 50,
};

export default function Map() {
  const { map, mapContainer, mapLoaded } = useMap(
    init_viewport,
    token,
    "mapbox://styles/jkendallbar/clx5ckkz001i601rb6xo7eywz"
  );
  const [useCases, setUseCases] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const hoveredRef = useRef();
  const [features, setFeatures] = useState([]);
  const [data, setData] = useState();
  const [callouts, setCallouts] = useState([]);
  const [disclaimer, setDisclaimer] = useState(true);
  const canvasRef = useRef();
  const BL_Callout = useRef();
  const initialSpinTimeout = useRef();
  const onMapMoveRef = useRef();

  useEffect(() => {
    getUseCases().then((r) => setUseCases(r));
  }, []);

  const getFeatures = useCallback(() => {
    const width = map.getCanvas().clientWidth;
    const height = map.getCanvas().clientHeight;

    const center = { x: width / 2, y: height / 2 };
    return map?.queryRenderedFeatures({ layers: ["data"] }).map((f) => {
      try {
        f["pos"] = map.project([f.properties.Longitude, f.properties.Latitude]);
      } catch {
        console.log("ERROR");
        console.log(f);
        f["pos"] = { x: 1000000, y: 1000000 };
      }
      f["distance_to_corners"] = Object();
      f["distance_to_corners"].bottom_left = height - f["pos"].y + f["pos"].x;
      f["distance_to_corners"].top_right = f["pos"].y + width - f["pos"].x;
      f["distance_to_center"] = Math.sqrt(
        Math.pow(f["pos"].y - center.y, 2) + Math.pow(f["pos"].x - center.x, 2)
      );
      return f;
    });
  }, [map]);

  useEffect(() => {
    onMapMoveRef.current = () => {
      if (!map) return;
      const features = getFeatures();

      if (features.length < 2) {
        setCallouts([]);
        const ctx = canvasRef.current?.getContext("2d");
        const width = map.getCanvas().clientWidth;
        const height = map.getCanvas().clientHeight;
        ctx?.clearRect(0, 0, width, height);
        return;
      }
      const f1 = data
        ? features.find((f) => f.properties.Title === data.Title)
        : hoveredRef.current
        ? features.find((f) => f.id === hoveredRef.current)
        : features.sort(
            (a, b) => a.distance_to_center - b.distance_to_center
          )[0];

      const _callouts = [
        {
          loc: "bottom_left",
          data: f1,
          ref: BL_Callout,
        },
      ];
      setCallouts(_callouts);
    };
  }, [map, data, features, getFeatures]);

  const addData = useCallback(
    async (map) => {
      const projectData = await fetchProjectData();
      const features = createGeojsonFromResponse(projectData.results);
      setFeatures(features);

      map.addLayer({
        id: "data",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features,
          },
        },
        paint: {
          "circle-color": ["get", "color"],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            4,
            1,
          ],
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.3)",
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            1,
            5,
            5,
            7,
            10,
            15,
            20,
            20,
          ],
        },
      });
      map.on("click", "data", (e) => {
        setData(JSON_Parse(e.features[0].properties));
        setIsMenuOpen(true);
      });
      map.on("mousemove", "data", (e) => {
        if (e.features.length === 0) return;
        map.getCanvas().style.cursor = "pointer";
        hoveredRef.current = e.features[0].id;
        map.setFeatureState(
          { source: "data", id: hoveredRef.current },
          { hover: true }
        );
        if (onMapMoveRef.current) {
          onMapMoveRef.current();
        }
      });
      map.on("mouseleave", "data", () => {
        if (hoveredRef.current) {
          map.setFeatureState(
            { source: "data", id: hoveredRef.current },
            { hover: false }
          );
        }

        hoveredRef.current = null;
        map.getCanvas().style.cursor = "";
        if (onMapMoveRef.current) {
          onMapMoveRef.current();
        }
      });
      map.on("move", () => {
        if (onMapMoveRef.current) {
          onMapMoveRef.current();
        }
      });
    },
    [setFeatures, setData, setIsMenuOpen, hoveredRef, onMapMoveRef]
  );

  useEffect(() => {
    if (!map) return;
    map.on("load", () => {
      addData(map);
    });
    map.on("style.load", () => {
      map.setFog({
        color: "rgba(186, 210, 235, 0.2)", // Lower atmosphere
        "high-color": "rgba(36, 92, 223, 0.4)", // Upper atmosphere
        "horizon-blend": 0.005, // Atmosphere thickness (default 0.2 at low zooms)
        "space-color": "rgb(11, 11, 25)", // Background color
        "star-intensity": 0.35, // Background star brightness (default 0.35 at low zoooms )
      });
    });
  }, [map, addData]);

  useEffect(() => {
    if (callouts.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
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
      ctx.strokeStyle = "grey"; // You can change the color here
      ctx.lineWidth = 1; // You can change the line width here
      ctx.stroke();
    }

    const bl = callouts.filter((c) => c.loc === "bottom_left")[0];
    if (!bl.data) return;
    drawLine(
      bl.data.pos.x,
      bl.data.pos.y,
      bl.data.pos.x - callout_offsets.x,
      bl.data.pos.y + callout_offsets.y
    );
  }, [callouts, map]);

  useEffect(() => {
    if (!data) return;
    map.flyTo({
      center: [data.Longitude, data.Latitude + 10],
      essential: true,
      zoom: 4,
    });
    clearInterval(initialSpinTimeout.current);
  }, [data, map]);

  // Initial Spin
  useEffect(() => {
    if (!mapLoaded || data) return;
    setTimeout(() => {
      initialSpinTimeout.current = setInterval(() => {
        const { lng, lat } = map.getCenter();
        map.flyTo({
          center: [lng + 0.04, lat],
          essential: true,
        });
      }, 5);
      map.on("mousedown", () => clearInterval(initialSpinTimeout.current));
    }, 500);
  }, [map, mapLoaded, data]);

  // Zoom out
  useEffect(() => {
    if (!mapLoaded || data) return;
    const { lng, lat } = map.getCenter();
    map.flyTo({
      center: [lng, lat],
      zoom: 2,
    });
  }, [data, map, mapLoaded]);

  const icon = useMemo(
    () => (
      <div
        className="mobile-icon-container"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Icon
          icon={
            isMenuOpen
              ? "material-symbols:map-outline"
              : "mingcute:arrow-right-line"
          }
          className="icon"
        />
      </div>
    ),
    [isMenuOpen]
  );

  const header = data ? (
    <div className="header" onClick={() => setData()}>
      <div className="back-arrow-container">
        <div className="back-arrow" />
      </div>
      <div className="text">Back To Project List</div>
      {icon}
    </div>
  ) : (
    <div className="header" onClick={() => setData()}>
      <div className="title">
        <img src={earthGraphic} className="site-icon" />
        <span className="title1">ECO</span>
        <span className="title2">VIZ</span>
        <span className="subtitle">{" Explorer"}</span>
      </div>
      {icon}
    </div>
  );

  const itemClass = useCallback(
    (d) => d.properties.Topic.split(" ").join("-"),
    []
  );

  const itemOnClick = useCallback((d) => {
    setData(d.properties);
  }, []);

  return (
    <div className="screen">
      <Menu header={header} isOpen={isMenuOpen}>
        {data ? (
          <DataView data={data} />
        ) : (
          <CategoricalClassyList
            data={features}
            useCases={useCases}
            display_property={(d) => d.properties.Title}
            category_property={(d) => d.properties.Topic}
            classes={["video-popup"]}
            itemClass={itemClass}
            itemOnClick={itemOnClick}
          />
        )}
        <div className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className="menu-toggle-bar" />
        </div>
      </Menu>
      <div className="canvas-container">
        <canvas id="canvasID" ref={canvasRef}>
          Canvas not supported
        </canvas>
        <div ref={mapContainer} className="map-container" />
        {callouts.map((c) =>
          c.data ? (
            <div
              key={c.data.properties.Title}
              className={"callout-container " + c.loc}
              ref={c.ref}
              style={{
                position: "absolute",
                left: canvasRef.current.getBoundingClientRect().left,
                right: canvasRef.current.getBoundingClientRect().right,
                top: canvasRef.current.getBoundingClientRect().top,
                bottom: canvasRef.current.getBoundingClientRect().bottom,
              }}
            >
              <div
                className="callout"
                style={{
                  position: "relative",
                  left:
                    c.data.pos.x +
                    (c.loc === "bottom_left"
                      ? -callout_offsets.x - 50
                      : callout_offsets.x),
                  top:
                    c.data.pos.y +
                    (c.loc === "top_right"
                      ? -callout_offsets.y - 50
                      : callout_offsets.y),
                  width: 150,
                }}
                onClick={() => {
                  setData(JSON_Parse(c.data.properties));
                  setIsMenuOpen(true);
                }}
              >
                {c.data.properties.Title}
              </div>
            </div>
          ) : null
        )}
      </div>
      {data && <DetailDemo url={data.URL} />}
      <ProjectsIntroduction
        show={disclaimer}
        setShow={setDisclaimer}
        useCases={useCases}
      />
    </div>
  );
}
