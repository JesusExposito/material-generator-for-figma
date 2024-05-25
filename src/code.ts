import generateColorVariant from "./utils/materialPalette";
import contrastCheck from "./utils/ContrastCheck";
import {IColor} from "./interfaces/iColor";
import {IColorVariant} from "./interfaces/iColorVariant";
import tinycolor from "tinycolor2";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 360, height: 480});

// Usage:
/*const colorHex = '#F44336';
const variants = generateColorVariant("red", colorHex);
console.log(variants);*/

/*---Globals---*/
const _WIDTH_ = 430;
const _HEIGHT_ = 64;

function hexToRgb(color: { r: number, g: number, b: number, a: number }) {
  return { r: color.r / 255 , g: color.g / 255 , b: color.b / 255 };
}

function collectionExistsByName(name:string): boolean {
  const localCollections = figma.variables.getLocalVariableCollections();
  return localCollections.find(el => el.name === name )? true: false;
}

function getCollectionByName(name: string): VariableCollection | undefined {
  const localCollections = figma.variables.getLocalVariableCollections();
  return localCollections.find( el => el.name === name );
}

async function createTextForFrame(item: IColor | IColorVariant, parentNode: FrameNode | GroupNode, fontSize: number = 16){
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  //Create title
  let title = figma.createText();
  title.characters = item.name;
  title.fontSize = fontSize;
  //Check contrast (black or white)
  let textColor = contrastCheck(item.hex) == 1 ? {r:0,g:0,b:0}: {r:1,g:1,b:1};
  title.fills = [{ type: 'SOLID', color: textColor }];
  //Append and position
  parentNode.appendChild(title);
  title.layoutSizingHorizontal = 'FILL';

  //Create HEX value
  let val = figma.createText();
  val.characters = (`#${item.hex}`).toUpperCase();
  val.fontSize = fontSize;
  val.textAlignHorizontal = 'RIGHT';
  val.fills = [{ type: 'SOLID', color: textColor }];
  parentNode.appendChild(val);
  val.layoutSizingHorizontal = 'FILL';

}


figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  switch (msg.type) {
    case 'create': {
      let color = msg.hex;
      const variants = generateColorVariant(msg.name, color);
      if(variants) {
        const colorFrame = figma.createFrame();
        // Setup frame
        colorFrame.layoutMode = "VERTICAL";
        colorFrame.primaryAxisAlignItems = "CENTER";
        colorFrame.name = `${msg.name}-color-variants`;
        colorFrame.layoutSizingHorizontal = 'HUG';

        //Create parent rectangle
        const parentColor = figma.createFrame();
        parentColor.name = variants.name;
        parentColor.fills = [{ type: 'SOLID', color: hexToRgb(variants.rgb) }];
        parentColor.layoutMode = "HORIZONTAL";
        parentColor.primaryAxisAlignItems = "MIN";
        parentColor.counterAxisAlignItems = "CENTER";
        parentColor.layoutSizingHorizontal = 'FIXED';
        parentColor.resize(_WIDTH_, _HEIGHT_);
        parentColor.horizontalPadding = parentColor.verticalPadding = 16;

        let localCollection = getCollectionByName('Color primitives');
        //Create collection if not created
        if(!collectionExistsByName('Color primitives'))
          localCollection = figma.variables.createVariableCollection('Color primitives');

        //Add base color to collection
        if (!localCollection)
          return;

        const modeId = localCollection.modes[0].modeId;
        const colorVariable = figma.variables.createVariable(`${parentColor.name}/${parentColor.name}`, localCollection.id, "COLOR");
        colorVariable.setValueForMode(modeId, hexToRgb(variants.rgb));


        createTextForFrame(variants, parentColor, 14).then(()=>{
          colorFrame.appendChild(parentColor);
        });

        //Iterate over variants
        variants.variants.forEach(variant => {
          const element = figma.createFrame();
          element.name = variant.name;
          element.fills = [{ type: 'SOLID', color: hexToRgb(variant.rgb) }];
          element.layoutMode = "HORIZONTAL";
          element.primaryAxisAlignItems = "MIN";
          element.counterAxisAlignItems = "CENTER";
          element.layoutSizingHorizontal = 'FIXED';
          element.resize(_WIDTH_, _HEIGHT_);
          element.horizontalPadding = element.verticalPadding = 16;

          if (localCollection) {
            const colorVariable = figma.variables.createVariable(`${parentColor.name}/${element.name}`, localCollection.id, "COLOR");
            colorVariable.setValueForMode(modeId, hexToRgb(variant.rgb));
          }

          createTextForFrame(variant, element, 14).then(()=>{
            colorFrame.appendChild(element);
          });
        });

        // Add to page
        figma.currentPage.appendChild(colorFrame);
      }
    }break;
    case 'tinycolorHSL':
      if(msg['hsl'])
        figma.ui.postMessage({type: 'tinyHSL', data: tinycolor(msg['hsl'])});
      break;
    case 'tinycolorHSLtoHEX':
      let colorHex = tinycolor(msg['hsl']);
      figma.ui.postMessage({type: 'tinyHSLtoHEX', data: colorHex.toHex()});
      break;
    case 'tinycolorHEXtoHSL':
      let color = tinycolor(msg.data);
      figma.ui.postMessage({type: 'tinyHEXtoHSL', data: color.toHsl()});
      break;
    case 'tinycolorHEXtoHSV':
      let _color = tinycolor(msg.data);
      figma.ui.postMessage({type: 'tinyHEXtoHSV', data: _color.toHsv()});
      break;
    case 'tinycolor':
      figma.ui.postMessage({type: 'tinycolor', data: tinycolor(msg.data)});
      break;
    case 'tinycolorToHue':
      let colorToHue = tinycolor(msg.data);
      let hueString = tinycolor('hsl '+ colorToHue.toHsl().h + ' 1 .5').toHslString();
      figma.ui.postMessage({type: 'tinyColorToHue', data: hueString})
      break;
    case 'tinycolorToPos':
      let colorToPos = tinycolor(msg.color);
      let hsl = colorToPos.toHsl();
      let hsv = colorToPos.toHsv();
      let x = msg.spectrumWidth * hsv.s;
      let y = msg.spectrumHeight * (1 - hsv.v);
      //var hueY = hueRect.height - ((hue / 360) * hueRect.height);
      figma.ui.postMessage({ type: 'tinyColorToPos', hsl: hsl, x: x, y: y, color: colorToPos });
      break;
    default:
      figma.closePlugin();
  }
};
