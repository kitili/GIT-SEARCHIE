
export default {
  basePath: 'https://kitili.github.io/GIT-SEARCHIE',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
