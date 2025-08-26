import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import './AddProd.css';

function AddProducts() {
    const history = useHistory()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [SupplyChain, setSupplyChain] = useState();
    const [Prod, setProd] = useState();
    const [ProdName, setProdName] = useState();
    const [ProdDes, setProdDes] = useState();
    const [ProdStage, setProdStage] = useState();


    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                "Non-Ethereum browser detected. You should consider trying MetaMask!"
            );
        }
    };

    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            var i;
            const ProdCtr = await supplychain.methods.productCtr().call();
            const Prod = {};
            const ProdStage = [];
            for (i = 0; i < ProdCtr; i++) {
                Prod[i] = await supplychain.methods.productStock(i + 1).call();
                ProdStage[i] = await supplychain.methods.showStage(i + 1).call();
            }
            setProd(Prod);
            setProdStage(ProdStage);
            setloader(false);
        }
        else {
            window.alert('The smart contract is not deployed to current network')
        }
    }
    if (loader) {
        return (
            <div>
                <h1 className="wait">Loading...</h1>
            </div>
        )

    }
    const redirect_to_home = () => {
        history.push('/')
    }
    const handlerChangeNameProd = (event) => {
        setProdName(event.target.value);
    }
    const handlerChangeDesProd = (event) => {
        setProdDes(event.target.value);
    }
    const handlerSubmitProd = async (event) => {
        event.preventDefault();
        try {
            var reciept = await SupplyChain.methods.addproduct(ProdName, ProdDes).send({ from: currentaccount });
            if (reciept) {
                loadBlockchaindata();
            }
        }
        catch (err) {
            alert("An error occured!!!(Make sure you have entered the correct values and are an Owner)")
        }
    }
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Place Order</h2>
                <button onClick={redirect_to_home} className="btn btn-outline-danger">Home</button>
            </div>
            <div className="alert alert-info">
                <strong>Current Account Address:</strong> {currentaccount}
            </div>

            <div className="row">
                <div className="col-12">
                    <h5>Add Product Order:</h5>
                    <form onSubmit={handlerSubmitProd} className="form-inline mb-4">
                        <input 
                            className="form-control form-control-sm mr-2" 
                            type="text" 
                            onChange={handlerChangeNameProd} 
                            placeholder="Product Name" 
                            required 
                        />
                        <input 
                            className="form-control form-control-sm mr-2" 
                            type="text" 
                            onChange={handlerChangeDesProd} 
                            placeholder="Product Description" 
                            required 
                        />
                        <button className="btn btn-outline-success btn-sm" type="submit">Order</button>
                    </form>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <h5>Ordered Products:</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Current Stage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(Prod).map(key => (
                                    <tr key={key}>
                                        <td>{Prod[key].id}</td>
                                        <td>{Prod[key].name}</td>
                                        <td>{Prod[key].description}</td>
                                        <td>{ProdStage[key] && ProdStage[key].replace(/Prodicine|Prod|Prod|Prod/g, 'Product')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddProducts;
