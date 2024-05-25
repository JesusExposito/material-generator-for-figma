import {IColorVariant} from "./iColorVariant";

export interface IColor {
    name: string;
    hex: string;
    rgb: { r: number, g: number, b: number, a: number };
    variants: IColorVariant[];
}