module.exports = {
  theme: {
    extend: {
      fontFamily: {
        pj: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
};
