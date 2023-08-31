const _ = require("lodash");
const aws = require("aws-sdk");
const config = require("./config");

aws.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

const textract = new aws.Textract();

// const getText = (result, blocksMap) => {
//   let text = "";

//   if (_.has(result, "Relationships")) {
//     result.Relationships.forEach((relationship) => {
//       if (relationship.Type === "CHILD") {
//         relationship.Ids.forEach((childId) => {
//           const word = blocksMap[childId];
//           if (word.BlockType === "WORD") {
//             text += `${word.Text} `;
//           }
//           if (word.BlockType === "SELECTION_ELEMENT") {
//             if (word.SelectionStatus === "SELECTED") {
//               text += `X `;
//             }
//           }
//         });
//       }
//     });
//   }

//   return text.trim();
// };

// const findValueBlock = (keyBlock, valueMap) => {
//   let valueBlock;
//   keyBlock.Relationships.forEach((relationship) => {
//     if (relationship.Type === "VALUE") {
//       // eslint-disable-next-line array-callback-return
//       relationship.Ids.every((valueId) => {
//         if (_.has(valueMap, valueId)) {
//           valueBlock = valueMap[valueId];
//           return false;
//         }
//       });
//     }
//   });

//   return valueBlock;
// };

// const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
//   const keyValues = {};

//   const keyMapValues = _.values(keyMap);

//   keyMapValues.forEach((keyMapValue) => {
//     const valueBlock = findValueBlock(keyMapValue, valueMap);
//     const key = getText(keyMapValue, blockMap);
//     const value = getText(valueBlock, blockMap);
//     keyValues[key] = value;
//   });

//   return keyValues;
// };

// const getKeyValueMap = (blocks) => {
//   const keyMap = {};
//   const valueMap = {};
//   const blockMap = {};

//   let blockId;
//   blocks.forEach((block) => {
//     blockId = block.Id;
//     blockMap[blockId] = block;

//     if (block.BlockType === "KEY_VALUE_SET") {
//       if (_.includes(block.EntityTypes, "KEY")) {
//         keyMap[blockId] = block;
//       } else {
//         valueMap[blockId] = block;
//       }
//     }
//   });

//   return { keyMap, valueMap, blockMap };
// };

module.exports = async (buffer) => {
  const params = {
    Document: {
      Bytes: buffer,
    },
    FeatureTypes: ["TABLES"],
    // QueriesConfig: {
    //   Queries: [
    //     {
    //       Text: "What is the insured name?",
    //       Alias: "INSURANCE_CARD_NAME",
    //     },
    // {
    //   Text: "What is the member id?",
    //   Alias: "INSURANCE_CARD_MEMBER_ID",
    // },
    // {
    //   Text: "What is the effective date?",
    //   Alias: "INSURANCE_CARD_EFFECTIVE_DATE",
    // },
    // {
    //   Text: "What is the office visit copay?",
    //   Alias: "INSURANCE_CARD_OFFICE_VISIT_COPAY",
    // },
    // {
    //   Text: "What is the specialist visit copay?",
    //   Alias: "INSURANCE_CARD_SPEC_VISIT_COPAY",
    // },
    // {
    //   Text: "What is the coinsurance amount?",
    //   Alias: "INSURANCE_CARD_COINSURANCE",
    // },
    // {
    //   Text: "What is the OOP max?",
    //   Alias: "INSURANCE_CARD_OOP_MAX",
    // },
    // {
    //   Text: "What is medical insurance provider?",
    //   Alias: "INSURANCE_CARD_PROVIDER",
    // },
    // {
    //   Text: "What is the plan type?",
    //   Alias: "INSURANCE_CARD_PLAN_TYPE",
    // },
    // {
    //   Text: "What is the level of benefits?",
    //   Alias: "INSURANCE_CARD_LEVEL_BENEFITS",
    // },
    //   ],
    // },
  };

  const request = textract.analyzeDocument(params);
  const data = await request.promise();

  console.log("data", data);
  return data;
};

//   if (data && data.Blocks) {
//     const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
//     const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);

//     return keyValues;
//   }

//   // in case no blocks are found return undefined
//   return undefined;
// };
