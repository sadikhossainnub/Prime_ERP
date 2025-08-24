import axios from "axios";
import { API_KEY, API_SECRET, BASE_URL } from "../constants/config";

function generateItemCode(item: any) {
  const parts = [
    item.item_type,
    item.paper_name,
    item.paper_cup_size,
    item.box_name,
    item.bag_name,
    item.envelop_name,
    item.office_document_name,
    item.file_folder_name,
    item.brochure_name,
    item.calendar_name,
    item.window_size,
    item.bag_size,
    item.table_matt_size,
    item.box_size,
    item.sticker_size,
    item.tray_size,
    item.cone_size,
    item.leaflet_size,
    item.business_card_size,
    item.wrapping_paper_size,
    item.holder_size,
    item.file_folder_size,
    item.invoice_size,
    item.envelop_size,
    item.brand,
    item.sub_brand,
    item.origin
  ]
    .filter(part => part && String(part).trim() !== "")
    .map(part => String(part).trim());

  return parts.join("-");
}

function generateItemDescription(item: any) {
  const fields = {
    "Paper Cup Size": item.paper_cup_size,
    "Paper Cup Type": item.paper_cup_type,
    "Paper Cup Wall": item.paper_cup_wall,
    "Single Wall Paper GSM": item.single_wall_paper_gsm,
    "Double Wall Paper GSM": item.double_wall_paper_gsm,
    "Bottom GSM": item.bottom_gsm,
    "Printing Colour": item.printing_colour,
    "Laminnation": item.laminnation,
    "Foil": item.foil,
    "Origin": item.origin,
    "Brand": item.brand,
    "Sub Brand": item.sub_brand,
    "Lid Size": item.lid_size,
    "Lid Color": item.lid_color,
    "Lid Type": item.lid_type,
    "Quality": item.quality,
    "Paper Name": item.paper_name,
    "Paper GSM": item.paper_gsm,
    "Printing Metallic": item.printing_metallic,
    "Printing Sandy": item.printing_sandy,
    "Corrugated": item.corrugated,
    "Pasting": item.pasting,
    "Lock": item.lock,
    "Holder Size": item.holder_size,
    "Ambush": item.ambush,
    "Box Name": item.box_name,
    "Box Size": item.box_size,
    "Window": item.window,
    "Window Size": item.window_size,
    "Ribbon": item.ribbon,
    "Bag Name": item.bag_name,
    "Bag Size": item.bag_size,
    "Table Matt Size": item.table_matt_size,
    "Die Cut": item.die_cut,
    "Tray Size": item.tray_size,
    "Wrapping Paper Size": item.wrapping_paper_size,
    "Sticker Size": item.sticker_size,
    "Cone Name": item.cone_name,
    "Cone Size": item.cone_size,
    "Leaflet Size": item.leaflet_size,
    "Page Fold": item.page_fold,
    "Business Card Size": item.business_card_size,
    "Hang Tag Size": item.hang_tag_size,
    "Eye Late": item.eye_late,
    "Envelop Name": item.envelop_name,
    "Envelop Size": item.envelop_size,
    "Office Document Name": item.office_document_name,
    "Invoice Size": item.invoice_size,
    "Page": item.page
  };

  let description = "";

  // Add fixed fields
  for (const [label, value] of Object.entries(fields)) {
    if (value && String(value).trim() !== "") {
      description += `<b>${label}</b>: ${value}<br>`;
    }
  }

  // Add child table attributes if provided
  if (item.attributes && Array.isArray(item.attributes)) {
    item.attributes.forEach((attr: any) => {
      if (attr.attribute_value) {
        description += `<b>${attr.attribute}</b>: ${attr.attribute_value}<br>`;
      }
    });
  }

  return description.trim();
}

export async function createItem(itemData: any) {
  try {
    // 1️⃣ Generate item_code
    const item_code = generateItemCode(itemData);
    const description = generateItemDescription(itemData);

    // 2️⃣ Prepare payload (add ERPNext mandatory fields)
    const payload = {
      item_code,
      item_name: item_code,     // you can change this if you want
      item_group: "Products",   // must exist in your ERPNext
      stock_uom: "Nos",         // must exist in UOM list
      description,
      ...itemData,              // include all other fields
    };

    // 3️⃣ API call
    const res = await axios.post(
      `${BASE_URL}/api/resource/Item`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${API_KEY}:${API_SECRET}`
        }
      }
    );

    console.log("✅ Item created:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ Error creating Item:", err.response?.data || err.message);
    throw err;
  }
}