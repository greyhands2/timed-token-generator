import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { io } from 'socket.io-client';
const tokenSocket = io(
    `${process.env.REACT_APP_TOKEN_GEN_HOST}${process.env.REACT_APP_TOKEN_GEN_SOCKET_SERVER_ENDPOINT}`,
    {
        secure: true,
        reconnection: true,
        rejectUnauthorized: false,
    }
);

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Full viewport height */
`;

const StyledParagraphToken = styled.p`
  font-size: 6em;
  font-weight: bold;
  text-align: center;
  color: grey;
  margin: 0;
`;

const StyledParagraphCounter = styled.p`
  font-size: 4em;
  font-weight: bold;
  text-align: center;
  color: orange;
  margin: 0;
`;

const fetchData = async () => {
    const response = await fetch(
        `${process.env.REACT_APP_TOKEN_GEN_HOST}${process.env.REACT_APP_TOKEN_GEN_FETCH_TOKEN_ENDPOINT}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

const DisplayTokenComponent = () => {
    const [token, setToken] = useState("XXXXXX");
    const [counter, setCounter] = useState(0);
    const { data, isLoading, error, refetch } = useQuery("yourQueryKey", fetchData, {
        onSuccess: (fetchedData) => {
            console.log(fetchData)
            setToken(fetchedData.data.token);
            setCounter(fetchedData.data.time);
        },
        enabled: false, // Disable automatic refetch
    });

    useEffect(() => {
        refetch();
        tokenSocket.connect();
        tokenSocket.on("connect_error", (err) => {
            console.log("the error", err.message);
        });
        tokenSocket.on("token", (data) => {
            setToken(data.token);
            setCounter(data.time);
        });
    }, []);

    useEffect(() => {
        let timer;
        if (counter > 0) {
            timer = setInterval(() => {
                setCounter((prevCounter) => prevCounter - 1);
            }, 1000);
        }
        return () => {
            clearInterval(timer);
        };
    }, [counter]);

    return (
        <StyledDiv>
            <StyledParagraphToken>{token}</StyledParagraphToken>
            <StyledParagraphCounter>{counter}</StyledParagraphCounter>
        </StyledDiv>
    );
};

export default DisplayTokenComponent;
