require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/UOg9ukDfoAUEmiGOiX7hppz5itR7gef-",
      accounts: [
        "22afa592fffbb3007f9b457296f9b801e12ed21cc968218a6cab18c94aa2ba44",
      ],
    },
  },
};
