import { listToString } from "../../utilities/text-formatting";
import "./dataView.css";

export function DetailDemo({ url }) {
  if (!url.includes("youtu.be"))
    return (
      <div className="video site">
        <iframe width="100%" height="100%" src={url}></iframe>
      </div>
    );
  return (
    <div className="video">
      <div>
        <a href={url} target="_blank">
          Link to Site
        </a>
      </div>
      <iframe width="100%" height="100%" src={url}></iframe>
    </div>
  );
}

function Block({ className, title, content }) {
  return (
    <div className={"block " + className}>
      <div className="title">{title}</div>
      {content}
    </div>
  );
}

export default function DataView({ data, classes = [] }) {
  return (
    <>
    <img src={data.Thumbnail} alt={data.Title} className="thumbnail" />
    <div className={"data-view " + classes.join(" ")}>
      <div className="title">{data.Title}</div>
      <Block
        className="type"
        title=""
        content={
          <div className="content">
            <div>{data.Tags}</div>
          </div>
        }
      />
      <div className="subtitle">{data["Short description"]}</div>
      <Block
        className="authors"
        title="Authors"
        content={
          <div className="content">
            {listToString(data.Authors)}
          </div>
        }
      />
      <Block
        className="institutions"
        title="Institutions"
        content={
          <div className="content">
            {listToString(data.Institutions)}
          </div>
        }
      />
      {data.Publication && (
        <Block
          className="publication"
          title="Publication"
          content={
            <div>
              <a
                className="button-link"
                href={data.Publication}
                target="_blank"
              >
                {data.Publication}
              </a>
            </div>
          }
        />
      )}
      {data.URL && (
        <div className="button-link">
        <a  href={data.URL} target="_blank">
          View site
          </a>
        </div>
      )}
    </div>
    </>
    
  );
}
