import "./splashscreen.css";
import hero from "../../assets/usvi_flooding_lowres.jpg";
import earthGraphic from "../../assets/earth_graphic.png";

import cccr from "../../assets/cccr.png";
import ucsd from "../../assets/ucsd.png";
import sdsc from "../../assets/sdsc.png";

const description_text =
  "A geospatial hub for multidimensional visualizations and data storytelling about impacts to ecosystems and nature-based solutions. From animal behavior to natural flood protection, we showcase biological resilience as a source for hope amidst global change.";

export default function SplashScreen({ setSplashScreen }) {
  return (
    <div className="splashscreen">
      <img src={hero} className="hero" />
      <div className="content-container">
        <div className="content">
          <img src={earthGraphic} className="site-icon" />
          <div className="title">
            <span className="title1">ECO</span>
            <span className="title2">VIZ</span>
          </div>
          <div className="subtitle">EXPLORER</div>
          <div className="description">{description_text}</div>
          <div
            className="enter-the-explorer"
            onClick={() => setSplashScreen(false)}
          >
            Enter The Explorer
          </div>
          <div className="logo-footer">
            <img src={cccr} />
            <img src={ucsd} className="ucsd" />
            <img src={sdsc} />
          </div>
        </div>
      </div>
    </div>
  );
}
