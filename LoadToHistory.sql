insert into DealerConnectEmailHistory(emailAddr,MailDate)
select emailAddr,DownloadDate from DealerConnectEmailList   where DownloadDate = '5/30/2018'
---------------------------------------------------------------------------------------------------
INSERT INTO DealerConnect_VinListALL
(DownloadDate,vin,year,make,model,city,state,miles,days_unseen,days_seen,first_seen,last_seen,max_unseen_gap,seen_dates)
SELECT CAST(GETDATE() AS DATE),vin,year,make,model,city,state,miles,days_unseen,days_seen,first_seen,last_seen,max_unseen_gap,seen_dates
FROM DealerConnect_VinList

DELETE DealerConnect_VinList

INSERT INTO DealerConnectContractsALL
(DownloadDate,Vin,NoContract,Message)
SELECT CAST(GETDATE() AS DATE),Vin,NoContract,Message 
FROM DealerConnectContracts

DELETE DealerConnectContracts

INSERT INTO DealerConnectDemogALL
(DownloadDate,Vin,Row,PurchaseDate,Description,FullName,OwnerStatus,Address,City,State,Zip,Phone,emailAddr,Title)
SELECT CAST(GETDATE() AS DATE),Vin,Row,PurchaseDate,Description,FullName,OwnerStatus,Address,City,State,Zip,Phone,emailAddr,Title
FROM DealerConnectDemog

DELETE DealerConnectDemog









