import { useEffect, useState } from "react";
import "./projects-introduction.css";
import earthGraphic from "../../assets/earth_graphic.png";

import FadeInOut from "./fade-in-out";
import { listToString } from "../../utilities/text-formatting";

const animationDuration = 500;

const AnimatedXIcon = ({ animationDuration }) => {
  const circumference = 2 * Math.PI * 14.5; // 2 * π * r

  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      {/* Black circle */}
      <circle cx="15" cy="15" r="14.5" fill="black" />

      {/* White X in the center */}
      <line x1="9" y1="9" x2="21" y2="21" stroke="white" strokeWidth="2" />
      <line x1="9" y1="21" x2="21" y2="9" stroke="white" strokeWidth="2" />

      {/* White border circle */}
      <circle
        cx="15"
        cy="15"
        r="14.5"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray={circumference}
        transform="rotate(-90, 15, 15)"
        style={{
          transition: `stroke-dashoffset ${animationDuration}ms ease-out`,
        }}
      />
    </svg>
  );
};

const addLineBreak = (str) =>
  str.split("\n").map((subStr) => {
    return (
      <>
        {subStr}
        <br />
      </>
    );
  });



export const ProjectsIntroduction = ({ show, setShow, useCases }) => {
  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    if (show) setShowClose(true);
  }, [show]);

  return (
    <FadeInOut
      show={show}
      animationDuration={animationDuration}
      additionalClasses={show ? "splash-screen-fade" : ""}
    >
      <div className="splash-screen-projects-intro">
        <div className="projects-intro-container">
          <div
            className="projects-intro-close-button"
            onClick={() => setShow(false)}
            role="button"
          >
            {showClose && <AnimatedXIcon animationDuration={5000} />}
          </div>
          <div className="projects-scroll-container">
            <div className="title">
              <img src={earthGraphic} className="site-icon" />
              <span className="title1">ECO</span>
              <span className="title2">VIZ</span>
              <span className="subtitle">EXPLORER</span>
            </div>

            <p>
              Explore three overlapping bodies of work visualizing multifaceted
              environmental data to characterize ecosystem impact and
              nature-based solutions.
            </p>
            <div className="projects-intro-content">
              {useCases.map((useCase) => (
                <div key={useCase.title}>
                  <div className="project-intro-thumbnail-container">
                    <div
                      className="project-intro-thumbnail"
                      style={{ backgroundImage: `url(${useCase.thumbnail})` }}
                    />
                    <div className="project-intro-thumbnail-outline" />
                    <img
                      src={useCase.logo}
                      alt=""
                      className="project-intro-logo"
                    />
                  </div>
                  <div className="project-intro-text-container">
                    <h3>{addLineBreak(useCase.title)}</h3>
                    <p className="project-intro-label">
                      Visualization Project Lead
                    </p>
                    <p className="project-intro-value">
                      {useCase.visualizationProjectLead}
                    </p>

                    <p className="project-intro-label">Visualization Team</p>
                    <p className="project-intro-list">
                      {listToString(useCase.visualizationTeam)}
                    </p>
                    <p className="project-intro-description">
                      {addLineBreak(useCase.description)}
                    </p>
                    <p className="project-intro-label">Funding</p>
                    <p className="project-intro-list funding">
                      {listToString(useCase.funding)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeInOut>
  );
};
