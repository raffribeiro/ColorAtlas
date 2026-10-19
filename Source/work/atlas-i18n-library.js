// Preset names stay authored. Search additionally accepts translated labels
// (including the localized fire/ice/smoke tutorial hints), without rewriting the
// user's query or serializing translated metadata into their saved palettes.
const atlasLibraryMatchesBeforeLocale=libraryMatches;
libraryMatches=function(entry,query){
 const locale=window.AtlasI18n;if(!locale||locale.locale==='en')return atlasLibraryMatchesBeforeLocale(entry,query);
 return locale.searchTerms(query).some(term=>atlasLibraryMatchesBeforeLocale(entry,term));
};
