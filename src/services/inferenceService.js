// src/services/inferenceService.js
const tf = require("@tensorflow/tfjs-node");

async function predictClassification(model, image) {
  try {
    const tensor = tf.node.decodeJpeg(image).resizeNearestNeighbor([224, 224]).expandDims().toFloat();

    const prediction = model.predict(tensor);

    const classes = ["Non-cancer", "Cancer"];

    const maxProb = tf.max(prediction, 1).dataSync()[0];
    console.log("maxProb : " + maxProb);

    let classResult;
    if (maxProb > 0.5) {
      classResult = 1; // Cancer
    } else {
      classResult = 0; // Non-cancer
    }

    const label = classes[classResult];
    console.log("label :" + label);
    let suggestion;

    if (label === "Cancer") {
      suggestion = "Segera periksa ke dokter!";
    } else {
      suggestion = "Anda sehat!";
    }

    return { label, suggestion };
  } catch (error) {
    console.error("error inference : " + error);
    throw new Error(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictClassification;
