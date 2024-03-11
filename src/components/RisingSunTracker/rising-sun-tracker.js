import { useState, useEffect } from "react";
import { Container, Button, Input, Label } from "semantic-ui-react";

import React from 'react'

import './rising-sun-tracker.css';

import { ethers } from "ethers";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import buffaloABI from '../../abi/Buffalos.json';
import hornABI from '../../abi/Horn.json';

const BUFF_ADR = process.env.REACT_APP_TESTNET != 'false' ? process.env.REACT_APP_BUFF_ADR_T : process.env.REACT_APP_BUFF_ADR_M;
console.log("Address=", BUFF_ADR);

const HORN_ADR = process.env.REACT_APP_TESTNET != 'false' ? process.env.REACT_APP_HORN_ADR_T : process.env.REACT_APP_HORN_ADR_M;
console.log("Address=", BUFF_ADR);

const bscProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_TESTNET != 'false' ? process.env.REACT_APP_RPC_TEST : process.env.REACT_APP_RPC_MAIN)

const buffalo = new ethers.Contract(BUFF_ADR, buffaloABI, bscProvider);


const maxMintAmount = 10;

let web3Provider = Object.keys(window).includes('ethereum') ? new ethers.providers.Web3Provider(window.ethereum, "any") : Object.keys(window).includes('web3') ? new ethers.providers.Web3Provider(window.web3, "any") : undefined;
let signer;

const RisingSunTracker = () => {

    const [user, setUser] = useState('');
    const [connected, setConnected] = useState(false);
    const [amount, setAmount] = useState("1");
    const [time, setTime] = useState(0);
    const [pendingTime, setPendingTime] = useState(0);
    const [price, setPrice] = useState(0);
    const [pendingPrice, setPendingPrice] = useState(0);
    const [totalMinted, setMinted] = useState(0);
    const [total, setTotal] = useState(0);

    const getBlockStart = () => {
        buffalo.getBlockStart().then(res => setTime(ethers.BigNumber.from(res).toNumber()));
    }

    const getNFTPrice = () => {
        buffalo.getNFTPrice(1).then(res => setPrice(res.div(ethers.BigNumber.from(1e15)).toNumber()/1000.0));
    }

    const getTotalSupply = () => {
        buffalo.totalSupply().then(res => setMinted(ethers.BigNumber.from(res).toNumber()));
    }

    const getMaxSupply = () => {
        buffalo.getMaxSupply().then(res => setTotal(ethers.BigNumber.from(res).toNumber()));
    }
    
    useEffect(() => {
        getBlockStart();
        getNFTPrice();
        getMaxSupply();
        getTotalSupply()
        setInterval(()=> getTotalSupply(), 60000);
    }, []);

    const balanceMsg = (msg) => toast(msg);

    const connect = async () => {
        web3Provider = Object.keys(window).includes('ethereum') ? new ethers.providers.Web3Provider(window.ethereum, "any") : Object.keys(window).includes('web3') ? new ethers.providers.Web3Provider(window.web3, "any") : undefined;

        // Prompt user for account connections
        if (web3Provider && !signer) {
            signer = web3Provider.getSigner();
            const chainId = await signer.getChainId();
            if((process.env.REACT_APP_TESTNET === 'false' && chainId === 56) || (process.env.REACT_APP_TESTNET === 'true' && chainId === 97)) {
                const adr = await signer.getAddress();
                setUser(adr);
                setConnected(true)
            }
            else {
                signer = undefined;
                balanceMsg("Wrong Network!");
            }
        }
    }

    const disconnect = () => {
        signer = undefined;
        setUser('');
        setConnected(false);
    }

    
    const mint = async () => {
        if (signer) {
            const buffalo_write = writableContract();
            try {
                await buffalo_write
                    .mintBuffalo(parseInt(amount))
                    .then((res) => {
                        balanceMsg("Successfully minted : " + amount);
                    });
            } catch (e) {
                balanceMsg("You can't mint!")
            }
        }
        else alert("Please connect your wallet");
    } 

    const updateTime = async () => {
        if (signer) {
            const buffalo_write = writableContract();
            try {
                await buffalo_write
                    .updateBlockStart(pendingTime)
                    .then((res) => {
                        balanceMsg("Successfully time updated : " + pendingTime);
                        setTime(pendingTime);
                    });
            } catch (e) {
                balanceMsg("Time update Error!")
            }
        }
        else alert("Please connect your wallet");
    } 

    const updatePrice = async () => {
        if (signer) {
            const buffalo_write = writableContract();
            try {
                await buffalo_write
                    .updateMintPrice(parseInt(pendingPrice * 1000))
                    .then((res) => {
                        balanceMsg("Successfully price set : " + pendingPrice);
                        setPrice(pendingPrice);
                    });
            } catch (e) {
                const errorMsg = e.data.message;
                if(errorMsg.includes("nonexist")) balanceMsg("There is nonexisting ID!");
                else balanceMsg("There is an ID that doesn't belong to you!")
            }
        }
        else alert("Please connect your wallet");
    } 

    const writableContract = () => {
        return new ethers.Contract(BUFF_ADR, buffaloABI, signer);
    }

    const writableHornContract = () => {
        return new ethers.Contract(HORN_ADR, hornABI, signer);
    }

    const setMintAmount = (val) => {
        if(val > maxMintAmount) {
            balanceMsg("Exceed Max Amount!")
            setAmount("1");
        }
        else setAmount(val);
    }

    const approve = async () => {
        if (signer) {
            const hornContract = writableHornContract();
            try {
                await hornContract
                    .approve(BUFF_ADR, ethers.BigNumber.from(1e15).mul(ethers.BigNumber.from(1e6)))
                    .then(() => {
                        balanceMsg("Successfully approved : " + BUFF_ADR);
                    });
            } catch (e) {
                console.log(e);
                balanceMsg("There is an error while you approve contract!")
            }
        }
        else alert("Please connect your wallet");
    }
    

    return (
        <Container>
            <video autoPlay muted loop playsInline className="bgVideo">
                <source src="./video.mp4" type="video/mp4" />
            </video>
            <div className="rsun-tracker-container">
                <img className="logoImage" src="./logo.png" alt="logo" />
                <Button type="button" className={"rsun-tracker-button wallet-button connect-button" + (connected ? " hidden" : "")} onClick={connect}>Connect</Button>
                <Button type="button" className={"rsun-tracker-button wallet-button connect-button" + (!connected ? " hidden" : "")} onClick={disconnect}>Disconnect</Button>
                {/* <span className="wallet-button-text">(Metamask and Trustwallet only)</span> */}

                <div className="title-section">
                    <h1>{totalMinted} Minted Among {total} Buffalos</h1>
                </div>
                
                <div className="rsun-tracker-reflect rsun-tracker-section margin-top-0 padding-top-0">
                    <div className="stats-box min-height-unset margin-top-0">
                        <div className="ui inverted input input-wrapper margin-top-0">
                            <input 
                                placeholder="Type Mint Amount" 
                                type="text" 
                                value={amount}
                                onKeyPress={(event) => 
                                    {
                                        if (!/[0-9]/.test(event.key)) 
                                            {event.preventDefault();}
                                    }
                                }
                                onChange={event => setMintAmount(event.target.value)}
                            />
                        </div>
                    </div>
                </div>    
                
                <Button type="button" disabled={!connected} className={"rsun-tracker-button claim-button button-top"} onClick={approve}>Approve</Button>                
                <Button type="button" disabled={!connected} className={"rsun-tracker-button claim-button button-top"} onClick={mint}>Mint</Button>

                <div className="rsun-tracker-reflect rsun-tracker-section">
                    <div className="stats-box">
                        <h3>Update Start Date/Time</h3>
                        <div className="ui inverted input input-wrapper margin-top-0">
                            <input 
                                placeholder="Type Timestamp" 
                                type="text" 
                                onKeyPress={(event) => 
                                    {
                                        if (!/[0-9]/.test(event.key)) 
                                            {event.preventDefault();}
                                    }
                                }
                                onChange={event => setPendingTime(parseInt(event.target.value))}
                            />
                        </div>
                        <h4>Current Start Time: {time}</h4>
                        <Button type="button" disabled={!connected} className={"rsun-tracker-button claim-button button-top"} onClick={updateTime}>Update Time</Button>
                    </div>
                    <div className="stats-box">
                        <h3>Update Price per NFT</h3>
                        <div className="ui inverted input input-wrapper margin-top-0">
                            <input 
                                placeholder="Type Price" 
                                type="text" 
                                onKeyPress={(event) => 
                                    {
                                        if (!/[0-9.]/.test(event.key)) 
                                            {event.preventDefault();}
                                    }
                                }
                                onChange={event => setPendingPrice(parseFloat(event.target.value))}
                            />
                        </div>
                        <h4>Current Price: {price} Horn</h4>
                        <Button type="button" disabled={!connected} className={"rsun-tracker-button claim-button button-top"} onClick={updatePrice}>Update Price</Button>
                    </div>
                </div>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              // pauseOnHover
            />
        </Container>
    );
}

export default RisingSunTracker