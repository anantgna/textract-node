const _ = require("lodash");
const aws = require("aws-sdk");
const config = require("./config");

//Add awsAccesskeyID, awsSecretAccessKey, awsRegion in .config file
aws.config.update({
  accessKeyId: config.awsAccesskeyID,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.awsRegion,
});

const textract = new aws.Textract();

//Helper function for combining Query Result Pairs
const findKeyValuePair = (keyBlock, valueMap) => {
  let valueBlock;
  let keyValuePair = {};

  if (keyBlock.Relationships) {
    keyBlock.Relationships.forEach((relationship) => {
      if (relationship.Type === "ANSWER") {
        relationship.Ids.every((valueId) => {
          if (_.has(valueMap, valueId)) {
            valueBlock = valueMap[valueId];
            return false;
          }
        });
      }
    });
    keyValuePair = {
      Query: keyBlock.Query.Text,
      Value: valueBlock.Text,
    };
  } else {
    keyValuePair = {
      Query: keyBlock.Query.Text,
      Value: undefined,
    };
  }

  return keyValuePair;
};

//Combining each query with its respective result using the id's
const getKeyValueRelationship = (keyMap, valueMap) => {
  const keyValues = [];
  const keyMapValues = _.values(keyMap);

  keyMapValues.forEach((keyMapValue) => {
    const keyValuePair = findKeyValuePair(keyMapValue, valueMap);
    keyValues.push(keyValuePair);
  });

  return keyValues;
};

//Separating Response based on the Query and Result
const getKeyValueMap = (blocks) => {
  const keyMap = {};
  const valueMap = {};

  let blockId;
  blocks.forEach((block) => {
    blockId = block.Id;

    if (block.BlockType === "QUERY") {
      keyMap[blockId] = block;
    } else if (block.BlockType === "QUERY_RESULT") {
      valueMap[blockId] = block;
    }
  });

  return { keyMap, valueMap };
};

module.exports = async (buffer) => {
  const params = {
    Document: {
      Bytes: buffer,
    },

    //FeatureTypes - ["QUERIES", "FORMS", "TABLES", "SIGNATURES"]
    FeatureTypes: ["QUERIES"],

    //Pass Queries along with Alias
    QueriesConfig: {
      Queries: [
        {
          Text: "What is the insured name?",
          // Alias: "INSURANCE_CARD_NAME",
        },
        {
          Text: "What is the member id?",
          // Alias: "INSURANCE_CARD_MEMBER_ID",
        },
        {
          Text: "What is the effective date?",
          // Alias: "INSURANCE_CARD_EFFECTIVE_DATE",
        },
        {
          Text: "What is the office visit copay?",
          // Alias: "INSURANCE_CARD_OFFICE_VISIT_COPAY",
        },
        {
          Text: "What is the specialist visit copay?",
          // Alias: "INSURANCE_CARD_SPEC_VISIT_COPAY",
        },
        {
          Text: "What is the coinsurance amount?",
          // Alias: "INSURANCE_CARD_COINSURANCE",
        },
        {
          Text: "What is the OOP max?",
          // Alias: "INSURANCE_CARD_OOP_MAX",
        },
        {
          Text: "What is medical insurance provider?",
          // Alias: "INSURANCE_CARD_PROVIDER",
        },
        {
          Text: "What is the plan type?",
          // Alias: "INSURANCE_CARD_PLAN_TYPE",
        },
        {
          Text: "What is the level of benefits?",
          // Alias: "INSURANCE_CARD_LEVEL_BENEFITS",
        },
        { Text: "What is the group number?" },
        { Text: "What Payer ID?" },
        { Text: "What is RX BIN?" },
        { Text: "What is RX GRP?" },
        { Text: "What is RX PCN?" },
      ],
    },
  };

  const request = textract.analyzeDocument(params);
  const data = await request.promise();

  if (data && data.Blocks) {
    const { keyMap, valueMap } = getKeyValueMap(data.Blocks);
    const keyValues = getKeyValueRelationship(keyMap, valueMap);
    return keyValues;
  }

  // in case no blocks are found return undefined
  return undefined;
};
