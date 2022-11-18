import React, { useState } from "react";
import {
  Button,
  InputLabel,
  MenuItem,
  Select,
  Card,
  FormControl,
  FormHelperText,
  TextField,
  Stack,
} from "@mui/material";
import { ethers } from "ethers";
import Donate1Percent_abi from "./donate1percent_abi.json";

const Donate1Percent = () => {
  let contractAddress = "0xE2DFC07f329041a05f5257f27CE01e4329FC64Ef";

  const [errorMessage, setErrorMessage] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [donationAmount, setDonationAmount] = useState(null);
  const [unsubscribeAddress, setSubscriptionAddress] = useState(null);

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          accountChangedHandler(result[0]);
          setConnButtonText("Wallet Connected");
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };

  // update account, will cause component re-render
  const accountChangedHandler = async (newAccount) => {
    setWallet(newAccount);
    getBalance(newAccount);
    updateEthers();
  };

  const getBalance = async (newAccount) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(newAccount);
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(balanceInEth / 100);
    setDonationAmount(balanceInEth / 100);
  };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };

  // listen for account changes
  window.ethereum.on("accountsChanged", accountChangedHandler);

  window.ethereum.on("chainChanged", chainChangedHandler);

  const updateEthers = async () => {
    let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);

    let tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);

    let tempContract = new ethers.Contract(
      contractAddress,
      Donate1Percent_abi,
      tempSigner
    );
    setContract(tempContract);
    console.log("tempContract: " + tempContract);
  };

  const setHandler = (event) => {
    event.preventDefault();
    console.log("Charity: " + charityAddress + " to the contract");
    console.log("Interval: " + intervalTime + " to the contract");
    updateEthers();
    contract.set(charityAddress, intervalTime);
  };

  const unSubscribe = async (newAccount) => {
    setSubscriptionAddress(newAccount);
    await contract.unsubscribe(unsubscribeAddress);
  };

  const [charityAddress, setCharity] = useState("");
  const [intervalTime, setInterval] = useState("");

  return (
    <>
      <div>
        <Stack
          mt={2}
          direction="column"
          justifyContent="space-between"
          alignItems="center"
          spacing={4}
        >
          <h2> {"Donate 1%"} </h2>
          <h4>
            <i> {"On Chain Philanthropy"} </i>
          </h4>
          <Card variant="outlined" sx={{ m: 5, p: 5, maxWidth: "50vw" }}>
            <Stack
              direction="column"
              justifyContent="space-between"
              alignItems="center"
              spacing={3}
              sx={{ maxHeight: "90vh" }}
            >
              <Button color="secondary" onClick={connectWalletHandler}>
                {connButtonText}
              </Button>
              <br />
              <TextField
                disabled
                sx={{ m: 1, minWidth: "30vw" }}
                helperText="Address"
                value={wallet}
              />
              <TextField
                disabled
                sx={{ m: 1, minWidth: "30vw" }}
                helperText="Your 1% donation (gas not included)"
                value={donationAmount}
              />

              <FormControl required sx={{ m: 1, minWidth: 300 }}>
                <InputLabel id="charityAddress">Choose your charity</InputLabel>
                <Select
                  autoWidth
                  id="charityAddress"
                  label="Choose your charity"
                  value={charityAddress}
                  onChange={(e) => setCharity(e.target.value)}
                >
                  <MenuItem
                    value={"0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"}
                  >
                    Charity 1
                  </MenuItem>
                  <MenuItem value={"0x22222"}>Charity 2</MenuItem>
                  <MenuItem value={"0x33333"}>Charity 3</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>

              <FormControl required sx={{ m: 1, minWidth: 300 }}>
                <InputLabel id="charityAddress">
                  Frequency of donation
                </InputLabel>
                <Select
                  autoWidth
                  id="intervalTime"
                  label="Frequency of donation"
                  value={intervalTime}
                  onChange={(e) => setInterval(e.target.value)}
                >
                  <MenuItem value={"24"}>Daily</MenuItem>
                  <MenuItem value={"168"}>Weekly</MenuItem>
                  <MenuItem value={"672"}>Monthly</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
                <br />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={setHandler}
                >
                  Donate
                </Button>
              </FormControl>
            </Stack>
          </Card>
          <br/>
          <Button variant="contained" color="secondary" onClick={unSubscribe}>
            Stop Donating
          </Button>
        </Stack>
      </div>
    </>
  );
};

export default Donate1Percent;
