import {IColor} from "../interfaces/iColor";
import {IColorVariant} from "../interfaces/iColorVariant";
import tinycolor from 'tinycolor2';

const materialColor = require('@aytek/material-color-picker');
/**
 * @function generateColorVariant this functions returns an array of color variants of a given color
 * @param name the name of the color
 * @param colorHex color value
 * @returns Array of color variant or undefined if it doesn't recognize color
 */
export default function generateColorVariant(name: string, colorHex: string): IColor | undefined {
    let color = tinycolor(colorHex);
    if(!color.isValid())
        return undefined;

    const variants: IColorVariant[] = [];
    const colorVariants = materialColor(colorHex);

    //Iterate over material variants
    for (const key in colorVariants) {
        const variantHex = `${colorVariants[key]}`;
        let n = (parseInt(key) === 50) ? 1 : ((parseInt(key) / 100)) % 5 + 1;
        const variantType = parseInt(key) <= 400 ? 'lighten' : 'darken';
        if(variantType === 'lighten')
            n = 6 - n;

        const rgb = tinycolor(colorVariants[key]).toRgb();

        const variantName = `${name}-${variantType}-${n}`;

        const variant: IColorVariant = {
            name: variantName,
            hex: variantHex,
            rgb: { R: rgb.r, G: rgb.g, B: rgb.b , A: rgb.a }
        };
        variants.push(variant);
    }
    let colorRGB = color.toRgb()
    const finalColor: IColor = {
        name: name,
        hex: colorHex,
        rgb:{ R: colorRGB.r, G: colorRGB.g, B: colorRGB.b, A: colorRGB.a },
        variants: variants
    };

    return finalColor;
}