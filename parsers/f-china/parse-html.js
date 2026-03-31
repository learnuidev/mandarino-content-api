const xRay = require("x-ray");

function partition(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function applyProcess({ content, process }) {
  if (process.skip) {
    return content;
  }
  try {
    switch (process.type.toLowerCase()) {
      // case "list-grammars":
      //   return "";
      case "trim":
        return content.trim();
      case "replace":
        return content.replace(process.from, process.to);
      case "replace-all":
        return content.replaceAll(process.from, process.to);
      case "replace-regex":
        return content.replace(new RegExp(process.from), process.to);
      case "replace-all-regex":
        return content.replaceAll(new RegExp(process.from, "g"), process.to);
      case "partition":
        return partition(content, process.value);
      case "slice":
        return content.slice(...process.values);
      case "split":
        return content.split(process.value);
      case "get-index":
        return content[process.indexValue];

      // Array Operations
      case "filter":
        return content.filter((item) => {
          switch (process.conditions[0]?.toLowerCase()) {
            case "boolean":
              return Boolean(item);
            case "eq":
              return item === process.conditions[1];
            case "not-eq":
              return item !== process.conditions[1];
            case "includes":
              return item.includes(process.conditions[1]);
            default:
              return item;
          }
        });
      case "map":
        return content.map((item) => {
          if (process?.conditions?.type) {
            switch (process?.conditions?.type?.toLowerCase()) {
              case "transform":
                return {
                  [process?.conditions?.key]: item,
                };
              default:
                return item;
            }
          }
          switch (process.conditions[0]?.toLowerCase()) {
            case "transform":
              return {
                [process.conditions[1]]: item,
              };

            case "split":
              return item.split(process.conditions[1]);

            case "slice":
              return item.slice(...process.conditions[1]);
            case "replace":
              return item.replace(process.conditions[1], process.conditions[2]);
            case "replace-regex":
              return item.replace(
                new RegExp(process.conditions[1]),
                process.conditions[2]
              );
            case "replace-all":
              return item.replaceAll(
                process.conditions[1],
                process.conditions[2]
              );
            case "replace-all-regex":
              return item.replaceAll(
                new RegExp(process.conditions[1]),
                process.conditions[2]
              );
            case "trim":
              return item.trim();
            case "multiply":
              switch (typeof item) {
                case "string":
                  return item.repeat(process.conditions[1]);
                case "number":
                  return item * process.conditions[1];
                default:
                  return item;
              }
            default:
              return item;
          }
        });
      default:
        return content;
    }
  } catch (err) {
    return {
      error: err.message,
      process,
      content,
    };
  }
}

function postProcess({ content, processes }) {
  return processes.reduce((acc, process) => {
    return applyProcess({ process, content: acc });
  }, content);
}

const parseHtml = async (event) => {
  console.log("EVENT", JSON.stringify(event));
  const { url, returns } = event;

  const x = xRay();

  const returnObj = {};

  // const returnKeys = Object.keys(returns)

  for await (const propertyKey of Object.keys(returns)) {
    let val;

    if (Array.isArray(returns[propertyKey]?.children)) {
      val = await x(
        url,
        returns[propertyKey]?.selector,
        returns[propertyKey]?.children
      );
    } else {
      val = await x(url, returns[propertyKey]?.selector);
    }

    const processes = returns[propertyKey]?.processes;

    if (processes) {
      returnObj[propertyKey] = postProcess({
        content: val,
        processes,
      });
    } else {
      returnObj[propertyKey] = val;
    }
  }

  return returnObj;
};

module.exports = {
  parseHtml,
};

// parseHtml({
//   // url: "https://baike.baidu.com/item/%E5%9B%B4%E6%A3%8B/111288",
//   url: "https://baike.baidu.com/item/%E5%A4%A7%E5%B1%B1%E7%9A%84%E5%A5%B3%E5%84%BF/61588325",
//   returns: {
//     title: {
//       selector: ".J-lemma-title",
//     },

//     summary: {
//       selector: ".lemmaSummary_xoHAz",
//       processes: [
//         {
//           type: "replace-all-regex",
//           // from: /[d+(-d+)?]/g,
//           from: "[\\[\\]\\d+(-\\d+)?]",
//           to: "",
//         },
//         {
//           type: "trim",
//         },
//       ],
//     },

//     episodeOne: {
//       selector: ".plotWrap_O20G_",
//     },
//   },
// }).then((res) => {
//   console.log(res);
// });
