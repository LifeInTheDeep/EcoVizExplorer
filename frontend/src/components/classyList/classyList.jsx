import "./classyList.css";

export default function ClassyList({
  data,
  display_property,
  itemOnClick,
  itemClass,
  classes = [],
}) {
  return (
    <div className={"classyList " + classes.join(" ")}>
      {data.map((d) => (
        <div className={"item " + itemClass(d)} onClick={() => itemOnClick(d)}>
          {display_property(d)}
        </div>
      ))}
    </div>
  );
}

export function CategoricalClassyList({
  data,
  category_property,
  display_property,
  itemOnClick,
  itemClass,
  classes = [],
}) {
  const categories = Array.from(
    new Set([...data.map((d) => category_property(d))])
  );
  const categorized_data = categories.map((c) => {
    const filtered_data = data.filter((d) => category_property(d) === c);
    return {
      category: c,
      icon: filtered_data[0].properties.Logo,
      data: filtered_data,
    };
  });

  return (
    <div className={"classyList " + classes.join(" ")}>
      {categorized_data.map((c) => (
        <div className="category">
          <div className="header">
            <div className="title">
              <img src={c.icon} alt="" className="category-icon" />
              {c.category}
            </div>
            <div className="icon-container">
              <div
                className="icon"
                style={{ backgroundColor: c.data[0].properties.color }}
              />
            </div>
          </div>
          <div className="content">
            {c.data.map((item) => (
              <ItemPreview
                key={display_property(item)}
                item={item}
                itemClass={itemClass}
                display_property={display_property}
                onClick={() => itemOnClick(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemPreview({ item, onClick, itemClass, display_property }) {
  return (
    <div className={"item " + itemClass(item)}>
      <p>
        <div class="chevron"></div>
        {display_property(item)}
      </p>
      <div className="item-preview">
        <div
          className="item-preview-background"
          style={{ backgroundImage: `url(${item.properties.Thumbnail})` }}
        >
          <div className="item-preview-overlay" />
          <div className="item-preview-container">
            <p className="item-preview-tag">{item.properties.Tags}</p>
            <button className="item-preview-button" onClick={onClick}>
              Read more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
