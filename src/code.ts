import generateColorVariant from "./utils/materialPalette";
import contrastCheck from "./utils/ContrastCheck";
import {IColor} from "./interfaces/iColor";
import {IColorVariant} from "./interfaces/iColorVariant";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 360, height: 480});

// Usage:
/*const colorHex = '#F44336';
const variants = generateColorVariant("red", colorHex);
console.log(variants);*/

/*---Globals---*/
const _WIDTH_ = 430;
const _HEIGHT_ = 64;

function hexToRgb(color: { R: number, G: number, B: number, A: number }) {
  return { r: color.R / 255 , g: color.G / 255 , b: color.B / 255 };
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

          createTextForFrame(variant, element, 14).then(()=>{
            colorFrame.appendChild(element);
          });
        });

        // Add to page
        figma.currentPage.appendChild(colorFrame);
      }

      console.log(variants);
    }break;
    case 'create-rectangles': {
      const nodes: SceneNode[] = [];
      for (let i = 0; i < msg.count; i++) {
        const rect = figma.createRectangle();
        rect.x = i * 150;
        rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
        figma.currentPage.appendChild(rect);
        nodes.push(rect);
      }
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }break;
    default:
      figma.closePlugin();
  }
};
