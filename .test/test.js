import { Printer, Image } from "@node-escpos/core";
// install escpos-usb adapter module manually
import USB from "@node-escpos/usb-adapter";
// Select the adapter based on your printer type
import { join } from "path";

const device = new USB();

device.open(async function(err){
  if(err){
    // handle error
    return
  }

  // encoding is optional
  const options = { encoding: "GB18030" /* default */ }
  let printer = new Printer(device, options);


  printer
    .font("a")
    .align("ct")
    .style("bu")
    .size(1, 1)
    .text("May the gold fill your pocket")
    .text("恭喜发财")
    .barcode(112233445566, "EAN13", { width: 50, height: 50 })
    .table(["One", "Two", "Three"])
    .tableCustom(
      [
        { text: "Left", align: "LEFT", width: 0.33, style: "B" },
        { text: "Center", align: "CENTER", width: 0.33 },
        { text: "Right", align: "RIGHT", width: 0.33 },
      ],
      { encoding: "cp857", size: [1, 1] }, // Optional
    )
    


  printer
    .cut()
    .close()
});