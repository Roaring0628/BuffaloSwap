// import React, { createContext, useContext, useEffect, useState } from 'react'

// import { getWeb3, getRisingSunTrackerContract, fromWei } from '../../Web3Util';

// import MainnetLpContract from '../../abi/LPMainnet.json';
// import TestnetLpContract from '../../abi/LPTestnet.json';
// import BogOracleContract from '../../abi/BogOracleMainnet.json'

// const lpContract = process.env.REACT_APP_NET === 'test' ? TestnetLpContract : MainnetLpContract;
// const lpAddress = process.env.REACT_APP_NET === 'test' ? process.env.REACT_APP_TEST_LP : process.env.REACT_APP_LP;

// const oracleContract = process.env.REACT_APP_NET === 'test' ? BogOracleContract : BogOracleContract;
// const oracleAddress = process.env.REACT_APP_NET === 'test' ? process.env.REACT_APP_BOG_PRICE_ORACLE : process.env.REACT_APP_BOG_PRICE_ORACLE; // same one intentionally, not sure if there's a testnet one

// const networkId = process.env.REACT_APP_NET === 'test' ? parseInt(process.env.REACT_APP_TESTNET_ID) : parseInt(process.env.REACT_APP_MAINNET_ID);


// const setLocalStorage = (key, value) => {
//     try {
//         window.localStorage.setItem(key, JSON.stringify(value)); // JSON.stringify(value)
//     } catch (e) {
//         console.error(e);
//         // catch possible errors:
//         // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
//     }
// }

// const getLocalStorage = (key, initialValue) => {
//     try {
//         const value = window.localStorage.getItem(key);
//         return value ? JSON.parse(value) : initialValue;
//     } catch (e) {
//         // if error, return initial value
//         return initialValue;
//     }
// }

// export const ContractDataContext = createContext();

// export const useContractDataContext = () => useContext(ContractDataContext);

// export const ContractDataProvider = ({ children }) => {
//     const [rsunTrackerContract, setRisingSunTrackerContract] = useState(() => getLocalStorage('rsunTrackerContract', undefined));
//     const [contractData, setContractData] = useState(() => getLocalStorage('contractData', undefined));
//     const [loadingData, setLoadingData] = useState(false);
//     const [reloadRequired, setReloadRequired] = useState(() => getLocalStorage('reloadRequired', false));
//     const [lpInst, setLpInst] = useState(() => getLocalStorage('lpInst', undefined));
//     const [oracleInst, setOracleInst] = useState(() => getLocalStorage('oracleInst', undefined));
//     const [user, setUser] = useState(() => getLocalStorage('user', undefined));
//     const [web3, setWeb3] = useState(undefined);
//     const [isFetchingLpPrice, setIsFetchingLpPrice] = useState(false);
//     const [lpPrice, setLpPrice] = useState(() => getLocalStorage('lpPrice', undefined));

//     const setup = async () => {
//         const web3 = await getWeb3();

//         let result;
//         try {
//             result = await web3.eth.net.getId()

//         } catch {
//             console.error("setup: unable to get networkID.")
//             return;
//         }
//         if (result !== networkId) {
//             console.error(`setup: Wrong network ID (expected ${networkId}, got ${result}).`);
//             setReloadRequired(true);
//             setLoadingData(false);
//             return;
//         }

//         setReloadRequired(false)

//         let rsunTrackerContract;
//         let lpInst = new web3.eth.Contract(lpContract, lpAddress);
//         let oracleInst = new web3.eth.Contract(oracleContract, oracleAddress);

//         if (web3) {
//             window.web3 = web3;
//             window.user = (await web3.eth.getAccounts())[0];
//             rsunTrackerContract = await getRisingSunTrackerContract(web3);
//             setWeb3(web3);
//         }

//         if (window.user) {
//             console.debug('wallet address: ', window.user);
//             setUser(window.user);
//         }

//         if (rsunTrackerContract) {
//             console.debug("rsunTrackerContract");
//             console.debug(rsunTrackerContract);
//             setRisingSunTrackerContract(rsunTrackerContract);
//         }

//         if (lpInst) {
//             console.debug("lpInst");
//             console.debug(lpInst);
//             setLpInst(lpInst);
//         }

//         if (oracleInst) {
//             console.debug("oracleInst");
//             console.debug(oracleInst);
//             setOracleInst(oracleInst);
//         }

//     }

//     useEffect(() => {
//         if (contractData) {
//             setup();
//         }
//     }, [])


//     useEffect(() => {
//         if (rsunTrackerContract && user && lpInst && web3) {
//             getData();
//             setInterval(
//                 () => getData(), 60000
//             )
//         }
//     }, [rsunTrackerContract, lpInst, user, web3])

//     const getData = () => {
//         console.debug("getData entered")
//         if (rsunTrackerContract && user && lpInst && web3) {
//             if (Object.keys(rsunTrackerContract.methods).length && Object.keys(lpInst.methods).length && Object.keys(web3.eth.net).includes("getId")) {
//                 console.debug("getData if statements passed")

//                 web3.eth.net.getId()
//                     .then(result => {
//                         if (result !== networkId) {
//                             console.error(`getData: Wrong network ID (expected ${networkId}, got ${result}).`)
//                             setReloadRequired(true);
//                             setLoadingData(false);
//                         } else {
//                             setReloadRequired(false)
//                             setData();
//                             console.debug("getData done")
//                         }
//                     })
//                     .catch(e => {
//                         console.error(e)
//                     });
//             }
//             setLocalStorage('user', user);
//             setLocalStorage('rsunTrackerContract', rsunTrackerContract);
//             setLocalStorage('lpInst', lpInst);
//         }
//     }

//     useEffect(() => {
//         setLocalStorage('contractData', contractData);
//     }, [contractData])

//     useEffect(() => {
//         setLocalStorage('reloadRequired', reloadRequired)
//     }, [reloadRequired])

//     const disconnectWallet = () => {
//         setRisingSunTrackerContract(undefined);
//         setContractData(undefined);
//         setLpInst(undefined);
//         setUser(undefined);
//         setWeb3(undefined);

//         window.sessionStorage.clear()
//     }

//     const connectWallet = async () => {
//         setLoadingData(true);
//         setup();
//     }

//     const setData = () => {
//         if (loadingData) {
//             setLoadingData(false);
//         }

//         setContractData({
            
//         })
//     }

//     const queryValue = async (contract_, methodName, args) => {
//         if (!contract_) {
//             console.error(`queryValue for ${methodName} failed: no rsunTrackerContract`)
//             return undefined
//         } else if (!methodName) {
//             console.error(`queryValue for ${methodName} failed: no methodName`)
//             return undefined
//         } else if (!Object.keys(contract_.methods).includes(methodName)) {
//             console.error(`queryValue for ${methodName} failed: method doesn't exist on rsunTrackerContract`)
//             return undefined
//         }

//         let x

//         try {
//             if (args) {
//                 x = contract_.methods[methodName](args).call()
//                     .catch(e => {
//                         console.error(`queryValue for ${methodName} failed: call failed`)
//                         console.error(e)
//                         return undefined
//                     })
//             } else {
//                 x = contract_.methods[methodName]().call()
//                     .catch(e => {
//                         console.error(`queryValue for ${methodName} failed: call failed`)
//                         console.error(e)
//                         return undefined
//                     })
//             }
//         } catch (e) {
//             console.error(`queryValue for ${methodName} failed: call failed`)
//             console.error(e)
//             return undefined
//         }

//         // console.debug(`queryValue for ${methodName} succeeded with response ${x}`)
//         return x

//     }

//     useEffect(() => {
//         if (web3 && rsunTrackerContract && networkId === 56 && lpInst && Object.keys(lpInst.methods) && oracleInst) {
//             fetchLpPrice()
//                 .catch(e => {
//                     console.error(e)
//                 })
//         }
//     }, [networkId, lpInst, oracleInst])

//     const fetchLpPrice = async () => {
//         setIsFetchingLpPrice(true);
//         console.debug("fetchLpPrice entered.")
//         console.debug(Object.keys(lpInst.methods))

//         if (lpInst && Object.keys(lpInst.methods).includes("getReserves") && Object.keys(lpInst.methods).includes("totalSupply") && oracleInst && Object.keys(oracleInst.methods).includes("getBNBSpotPrice")) {
//             let reserves;
//             try {
//                 reserves = await lpInst.methods.getReserves().call()
//             } catch (e) {
//                 console.error(e);
//             }
//             if (!reserves) {
//                 console.error("reserves is undefined.")
//                 setIsFetchingLpPrice(false);
//                 return undefined;
//             };

//             let totalSupply;
//             try {
//                 totalSupply = await lpInst.methods.totalSupply().call();
//             } catch (e) {
//                 console.error(e);
//             }
//             if (!totalSupply) {
//                 console.error("totalSupply is undefined.")
//                 setIsFetchingLpPrice(false);
//                 return undefined;
//             };

//             let bnbPrice;
//             try {
//                 bnbPrice = (await oracleInst.methods.getBNBSpotPrice().call()) / 10 ** 8;
//             } catch (e) {
//                 console.error(e);
//             }
//             if (!bnbPrice) {
//                 console.error("bnbPrice is undefined.")
//                 setIsFetchingLpPrice(false);
//                 return undefined;
//             };

//             let bnbAmount;
//             if (Object.keys(reserves).includes("_reserve0")) {
//                 bnbAmount = parseFloat(fromWei(reserves._reserve0));
//             }
//             if (!bnbAmount) {
//                 console.error("bnbAmount is undefined.")
//                 setIsFetchingLpPrice(false);
//                 return undefined;
//             }

//             const totalLpValue = 2 * bnbAmount * bnbPrice;
//             const pricePerLp = totalLpValue / parseFloat(fromWei(totalSupply));

//             console.debug("fetchLpPrice successfully executed with value " + pricePerLp)

//             setLpPrice(pricePerLp);
//         }

//     }

//     return (
//         <ContractDataContext.Provider value={{
//             connectWallet,
//             disconnectWallet,
//             rsunTrackerContract,
//             contractData,
//             loadingData,
//             reloadRequired,
//             lpInst,
//             isFetchingLpPrice,
//             lpPrice,
//             user,
//             web3,
//         }
//         }>
//             {children}
//         </ContractDataContext.Provider>
//     )
// };