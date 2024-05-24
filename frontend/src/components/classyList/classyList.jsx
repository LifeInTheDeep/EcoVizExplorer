import './classyList.css'

export default function ClassyList({ data, display_property, itemOnClick, itemClass, classes = [] }) {
    return <div className={"classyList " + classes.join(" ")}>
        {data.map(d => <div
            className={"item " + itemClass(d)}
            onClick={() => itemOnClick(d)}
        >{display_property(d)}</div>)}
    </div>
}


export function CategoricalClassyList({ data, category_property, display_property, itemOnClick, itemClass, classes = [] }) {
    const categories = Array.from(new Set([...data.map(d => category_property(d))]))
    const categorized_data = categories.map(c => {
        return {
            category: c,
            data: data.filter(d => category_property(d) === c)
        }
    })
    console.log(categorized_data)

    return <div className={"classyList " + classes.join(" ")}>
        {
            categorized_data.map(c => <div className='category'>
                <div className='header'>
                    <div className="title">
                        {c.category}
                    </div>
                    <div className='icon-container' >
                        <div className='icon' style={{backgroundColor: c.data[0].properties.color}}></div>
                    </div>
                </div>
                <div className='content'>{
                    c.data.map(d => <div
                        className={"item " + itemClass(d)}
                        onClick={() => itemOnClick(d)}
                    >{display_property(d)}</div>)
                }</div>
            </div>)
        }
    </div>
}
