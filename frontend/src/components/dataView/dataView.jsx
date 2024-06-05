import './dataView.css'

function FormatVideo(url) {
    if (!url.includes('youtu.be')) return <div className="video site">
        <div><a href={url} target="_blank">Link to Site</a></div>
        <iframe width="100%" height="100%"
            src={url}>
        </iframe>
    </div>
    const urlFormat = (u) => u.replace('https://youtu.be/', '').split('?')[0]

    return <div className="video">
        <div><a href={url} target="_blank">Link to Site</a></div>
        <iframe width="100%" height="100%"
            src={url}>
        </iframe>
    </div>
}

function Block({ className, title, content }) {
    return <div className={"block " + className}>
        <div className='title'>{title}</div>
        {content}
    </div>
}

export default function DataView({ data, classes = [] }) {
    console.log(data)
    return <div className={"data-view " + classes.join(" ")}>
        <div className='title'>{data.Title}</div>
        <Block className="authors" title="Authors" content={
            <div className='content'>
                {data.Authors.map(a => <div>{a}</div>)}
            </div>
        } />
        <Block className="type" title="Type" content={
            <div className='content'>
                {data.Tags}
            </div>
        } />
        <Block className="institutions" title="Institutions" content={
            <div className='content'>
                {data.Institutions.map(i => <div>{i}</div>)}
            </div>} />
        <Block className="publication" title="Publication" content={<div><a href={data.Publication} target='_blank'>{data.Publication}</a></div>} />
        {FormatVideo(data.URL)}
    </div>
}
