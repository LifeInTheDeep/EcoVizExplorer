import { useEffect, useState } from "react";
import "./projects-introduction.css";

import FadeInOut from "./fade-in-out";

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

const listToString = (list) => {
  const lastElement = list[list.length - 1];
  const listWithoutLastElement = list.slice(0, -1);
  return listWithoutLastElement.join(", ") + ", and " + lastElement;
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

export const ProjectsIntroduction = ({ show, setShow }) => {
  const [showClose, setShowClose] = useState(false);
  const [useCases, setUseCases] = useState([]);

  useEffect(() => {
    if (show) setShowClose(true);
  }, [show]);

  useEffect(() => {
    const URL = `${import.meta.env.VITE_APP_BACKEND_URL}/v1/databases/${
      import.meta.env.VITE_APP_USE_CASE_DATABASE_ID
    }/query`;
    fetch(URL, { method: "POST" })
      .then((r) => r.json())
      .then((r) => {
        setUseCases(formatUseCases(r.results));
      });
  }, []);

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
