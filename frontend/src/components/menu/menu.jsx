import "./menu.css";

export default function Menu({ header, children, isOpen, classes = [] }) {
  return (
    <div className={"menu " + classes.join(" ") + (isOpen ? "open" : "closed")}>
      {header}
      {children}
    </div>
  );
}
