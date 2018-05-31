
select * from DealerConnect_VinList where vin = '1C4BJWDG9JL926168' where Vin NOT IN (select Vin from DealerConnectContracts)  order by vin
select VIN FROM DealerConnect_VinList order by vin
select * from DealerConnectDemog where vin = '1C4PJLCB0HD231849'
select vin, count(*) from DealerConnectDemog group by vin order by count(*) desc

select * from DealerConnectContracts where vin = '1C6RR7KM9HS586680'
select vin, count(*) from DealerConnectContracts group by vin order by count(*) desc

--contracts
select VIN from DealerConnect_VinList WHERE Vin NOT IN (select Vin from DealerConnectContracts) AND (IsNumeric(RIGHT(Vin,1)) = 1) order by vin
--emails
select VIN from DealerConnect_VinList where Vin NOT IN (select Vin from DealerConnectDemog) AND Vin IN (select Vin from DealerConnectContracts group by Vin HAVING MIN(NoContract+0) = 1)  order by vin
select VIN from DealerConnect_VinList where Vin IN (select Vin from DealerConnectContracts group by Vin HAVING MIN(NoContract+0) = 1)  order by vin

select * from DealerConnectContracts   order by vin
select * from DealerConnectDemog   order by vin

select count(*)  from DealerConnect_VinList
select count(*)  from DealerConnect_VinListALL

select count(*)  from DealerConnectContracts
select count(*)  from DealerConnectContractsALL

select count(*)  from DealerConnectDemog
select count(*)  from DealerConnectDemogALL
--------------------------------------------------------------------------------------------
select * from DealerConnectEmailList
-- delete DealerConnectEmailList 
where DownloadDate = '5/30/2018' and emailAddr in (
select emailAddr from DealerConnectEmailList group by emailAddr having count(*) > 1
)
select emailAddr,COUNT(*),max(DownloadDate), min(DownloadDate) from DealerConnectEmailList group by emailAddr having count(*) > 1

select DownloadDate, count(*) from DealerConnectEmailList group by DownloadDate
-------------------------------------------



