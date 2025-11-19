import { toBase64 } from '@U'

export const SVGProps = {
    size: {type:Number, default: 48},
    fill: {type:String, default:"#3D3D3D"},
    clazz: {type:String, default:""}
}

export const buildSVGView = (size, svg)=>({
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url('data:image/svg+xml;base64,${toBase64(unescape(encodeURIComponent(svg)))}')`,
    backgroundSize: 'contain'
})