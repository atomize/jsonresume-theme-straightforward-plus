const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const extname = ".hbs";
const partialsDir = path.join(__dirname, "partials");

fs.readdirSync(partialsDir)
  .filter((filename) => path.extname(filename) === extname)
  .map((filename) => [
    filename,
    fs.readFileSync(path.join(partialsDir, filename), "utf8"),
  ])
  .forEach(([filename, template]) =>
    Handlebars.registerPartial(path.basename(filename, extname), template)
  );

// Handlebars.registerHelper('STRIP_PROTOCOL', urlStr => {
//   const result = urlStr.replace(/(^\w+:|^)\/\//, '');
//   return result;
// })

Handlebars.registerHelper("RECURSIVE_LIST", (items, indent = null) => {
  let html = "<ul>";
  let currentDepth = 0;
  items.forEach(function (item, i) {
    const depth =
      indent && indent[i]
        ? indent[i]
        : item.startsWith("-")
        ? item.match(/^-*/)[0].length
        : 0;
    while (depth > currentDepth) {
      html += "<ul>";
      currentDepth++;
    }
    while (depth < currentDepth) {
      html += "</ul>";
      currentDepth--;
    }
    html += "<li>" + item.replace(/^-*/, "") + "</li>";
  });
  while (currentDepth > 0) {
    html += "</ul>";
    currentDepth--;
  }
  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("SKILLS_SECTIONS", (keywords, sections = null) => {
  const html = sections
    ? "<ul>" +
      Object.entries(sections)
        .map(
          (section) =>
            "<li> <span class='title'>" +
            section[0] +
            ": </span>" +
            "<span>" +
            keywords
              .slice(
                ...section[1].map((x) => {
                  if (section[1].indexOf(x) > 0) {
                    x += 1;
                  }
                  return x;
                })
              )
              .join(", ") +
            ".</span></li>"
        )
        .join("") +
      "</ul>"
    : "<span>" + keywords.join(", ") + ".</span>";

  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("MONTH_YEAR", (dateString) => {
  // https://dockyard.com/blog/2020/02/14/you-probably-don-t-need-moment-js-anymore
  // https://stackoverflow.com/questions/5619202/parsing-a-string-to-a-date-in-javascript
  const dateObject = {
    year: "numeric",
  };
  if (isNaN(+dateString)) {
    dateObject.month = "short";
  }
  return new Date(dateString + "T00:00:00").toLocaleDateString(
    "en-US",
    dateObject
  );
});

Handlebars.registerHelper(
  "IF_DATES_HAVE_SAME_MONTH_AND_YEAR",
  function (arg1, arg2) {
    // prevents situation where we render same month/date combination
    // such as "Sept. 2020 - Sept. 2020"
    const d1 = new Date(arg1 + "T00:00:00");
    const d2 = new Date(arg2 + "T00:00:00");
    const matchingYear = d1.getFullYear() == d2.getFullYear();
    const matchingMonth = d1.getMonth() == d2.getMonth();
    return matchingYear && matchingMonth;
  }
);

Handlebars.registerHelper("join", (arr, separator) =>
  arr.join(typeof separator === "string" ? separator : ", ")
);
Handlebars.registerHelper("STATE_ABBREVIATION_TO_FULL_NAME", (state) => {
  const stateList = {
    AZ: "Arizona",
    AL: "Alabama",
    AK: "Alaska",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DC: "District of Columbia",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
    AS: "American Samoa",
    GU: "Guam",
    MP: "Northern Mariana Islands",
    PR: "Puerto Rico",
    VI: "U.S. Virgin Islands",
    UM: "U.S. Minor Outlying Islands",
  };
  if (stateList[state] != null) {
    return stateList[state];
  }
  return state;
});

Handlebars.registerHelper("STATE_NAME_TO_ABBREVIATION", (state) => {
  const stateList = {
    Arizona: "AZ",
    Alabama: "AL",
    Alaska: "AK",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
  };
  if (stateList[state] != null) {
    return stateList[state];
  }
  return state;
});

exports.render = (resume) => {
  const css = fs.readFileSync(path.join(__dirname, "style.css"), "utf-8");
  const template = fs.readFileSync(path.join(__dirname, "resume.hbs"), "utf-8");

  return Handlebars.compile(template)({ css, resume });
};
