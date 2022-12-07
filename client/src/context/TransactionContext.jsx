import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';



import {contractABI, contractAddress} from '../utils/constants';

export const TransactionContext = React.createContext();
const {ethereum} = window;

const getEthereumContract = () => {
const provider = new ethers.providers.Web3Provider(ethereum);
const signer = provider.getSigner();
const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

return transactionContract;
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({addressTo: '', amount: '', keyword: '', message: ''});
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }


    const getAllTransactions = async () => {
        try {
          if (!ethereum) return alert("please install metamask");
            const transactionsContract = getEthereumContract();
    
            const availableTransactions = await transactionsContract.getAllTransactions();
    
            const structuredTransactions = availableTransactions.map((transaction) => ({
              addressTo: transaction.receiver,
              addressFrom: transaction.sender,
              timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
              message: transaction.message,
              keyword: transaction.keyword,
              amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
    
            console.log(structuredTransactions);
    
            setTransactions(structuredTransactions);
         
        } catch (error) {
          console.log(error);
        }
      };

    const checkIfWalletIsConnected = async () => {
        try{
        if(!ethereum) return alert("please install metamask");
        const accounts = await ethereum.request({method: 'eth_accounts'});


        if(accounts.length) {
            setCurrentAccount(accounts[0]);
            getAllTransactions();
        }
        else {
            console.log('no accounts found');
        }
        }
        catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
        

        
    };

    const checkIfTransactionsExists = async () => {
        try {
          if (ethereum) {
            const transactionsContract = getEthereumContract();
            const currentTransactionCount = await transactionsContract.getTransactionCount();
    
            window.localStorage.setItem("transactionCount", currentTransactionCount);
          }
        } catch (error) {
          console.log(error);
    
          throw new Error("No ethereum object");
        }
      };
     
    const connectWallet = async () => {
        try{if(!ethereum) return alert("please install metamask");

        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        setCurrentAccount(accounts[0]);}
        catch (error){
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try{if(!ethereum) return alert("please install metamask");
        const {addressTo, amount, keyword, message } = formData;
        const transactionContract = getEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: currentAccount,
                to: addressTo,
                gas: '0x5208',
                value: parsedAmount._hex,

            }]
        });

        const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);
        setIsLoading(true);
        console.log('Loading - ${transactionHash.has}');
        await transactionHash.wait();
        setIsLoading(false);
        console.log('success - ${transactionHash.has}');
        
        const transactionCount = await transactionContract.getTransactionCount();
        setTransactionCount(transactionCount.toNumber());
    
    }
        catch(error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }


    useEffect( () => {
        checkIfWalletIsConnected();
        checkIfTransactionsExists();
    }, [transactionCount]);



    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading}}>
            {children}

        </TransactionContext.Provider>
    );
}


