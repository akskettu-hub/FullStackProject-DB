export interface ParsedYear {
  raw: string;
  year: number | null;
  isDecadeSuggestion: boolean;
  isUncertain: boolean;
}

const year_re = /^(\d{4})(S)?(\?)?$|^(\d{4})(\?)?(S)?$/;

export const parseYearToken = (token: string): ParsedYear => {
  const match = token.match(year_re);
  if (!match) {
    return {
      raw: token,
      year: null,
      isDecadeSuggestion: false,
      isUncertain: false,
    };
  }
  const year = Number(match[1] ?? match[4]);
  const isDecadeSuggestion = Boolean(match[2] ?? match[6]);
  const isUncertain = Boolean(match[3] ?? match[5]);
  return { raw: token, year, isDecadeSuggestion, isUncertain };
};

export interface ParsedTitleKey {
  raw: string;
  authenticity: string | null;
  year: number | null;
  yearRaw: string | null;
  yearIsDecadeSuggestion: boolean;
  yearIsUncertain: boolean;
  relationshipCode: string | null;
  correspondentCode: string | null;
  parseOk: boolean;
}

export const parseTitleKey = (
  titleKey: string | null | undefined,
): ParsedTitleKey => {
  const raw = titleKey ?? "";
  const empty: ParsedTitleKey = {
    raw,
    authenticity: null,
    year: null,
    yearRaw: null,
    yearIsDecadeSuggestion: false,
    yearIsUncertain: false,
    relationshipCode: null,
    correspondentCode: null,
    parseOk: false,
  };

  if (!raw.trim()) return empty;

  const tokens = raw.trim().split(/\s+/);
  if (tokens.length < 4) return empty;

  const [authenticity, yearToken, relationshipCode, ...rest] = tokens;

  if (typeof yearToken !== "string") return empty;
  const parsedYear = parseYearToken(yearToken);

  return {
    raw,
    authenticity: authenticity ?? null,
    year: parsedYear.year,
    yearRaw: parsedYear.raw,
    yearIsDecadeSuggestion: parsedYear.isDecadeSuggestion,
    yearIsUncertain: parsedYear.isUncertain,
    relationshipCode: relationshipCode ?? null,
    correspondentCode: rest.join(" ") || null,
    parseOk: parsedYear.year !== null,
  };
};

const test = [
  "A 1520S? FO JZOUCHE",
  "A 1520S FO EFITTON",
  "A 1530S T WWYBE",
  "A 1532? FN RWILLOUGHBY",
  "A 1532? FO RWILLOUGHBY",
  "D 1538 FO CBRANDON",
  "D 1530S T WFITZALAN",
  "A 1530S T JTEWKSBURY",
  "A 1530? FO AFITZHERBERT",
  "A 1529 FN EWILLOUGHBY",
  "A 1530? FN EWILLOUGHBY",
  "C 1532 FN EWILLOUGHBY",
  "C 1530? FN EWILLOUGHBY",
  "C 1530S? FN EWILLOUGHBY",
  "A 1530S FN EWILLOUGHBY",
  "A 1529? FO EFITTON",
  "D 1529? FO TGREY",
  "D 1530S FO MGREY",
  "A 1530S FO ALFITZHERBERT",
  "A 1530? T JBARWICK",
];

/*
for (const i in test) {
  console.log(test[i]);
  console.log(parseTitleKey(test[i]));
}
 */
let errors = 0;

test.forEach((element) => {
  console.log(element);
  let parsedElement = parseTitleKey(element);
  if (!parsedElement.parseOk) errors += 1;
  console.log(parsedElement);
});
console.log(errors);
