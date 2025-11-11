import dayjs from 'dayjs'

const YMD = "YYYY-MM-DD"
const HMS = "HH:mm:ss"

let formmat = (d=Date(), f=YMD)=> dayjs(d).format(f)

export const date       = (d=Date(), f=YMD)=> formmat(d, f)
export const datetime   = (d=Date(), f=`${YMD} ${HMS}`)=> formmat(d, f)