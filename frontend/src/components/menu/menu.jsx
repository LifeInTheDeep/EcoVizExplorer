import './menu.css'

export default function Menu({header, children, classes=[]}) {
    return <div className={"menu " + classes.join(" ")}>
        {header}
        {children}
    </div>
}
