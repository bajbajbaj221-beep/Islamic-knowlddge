 
const {
  withDangerousMod,
  withPlugins
} = require("@expo/config-plugins");

const fs = require("fs");
const path = require("path");

function withGradleDownloadMirror(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const wrapperFile = path.join(
        config.modRequest.platformProjectRoot,
        "gradle",
        "wrapper",
        "gradle-wrapper.properties"
      );

      let contents = await fs.promises.readFile(
        wrapperFile,
        "utf8"
      );

      if (!/^distributionUrl=.*$/m.test(contents)) {
        throw new Error("Gradle distributionUrl not found");
      }

      contents = contents.replace(
        /^distributionUrl=.*$/m,
        "distributionUrl=https\\://downloads.gradle.org/distributions/gradle-8.14.3-bin.zip"
      );

      await fs.promises.writeFile(
        wrapperFile,
        contents,
        "utf8"
      );

      return config;
    }
  ]);
}

module.exports = ({ config }) => {
  return withPlugins(
    withGradleDownloadMirror(config),
    [
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf"
    ]
  );
};
