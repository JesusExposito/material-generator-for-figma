import tinycolor from 'tinycolor2';

export default function contrastCheck(hexColor: string):number {
    const color = tinycolor(hexColor);
    const black = tinycolor('#000000');
    const white = tinycolor('#FFFFFF')
    if(color.isValid()){
        return tinycolor.isReadable(color,black,{level:"AAA",size:"large"}) ? 1:0;
    }
    return -1;
}