import {IColorVariant} from "./iColorVariant";

export interface IColor {
    name: string;
    hex: string;
    rgb: { R: number, G: number, B: number, A: number };
    variants: IColorVariant[];
}