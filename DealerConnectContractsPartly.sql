select VIN from DealerConnect_VinList where Vin NOT IN (select Vin from DealerConnectDemog) AND Vin IN (select Vin from DealerConnectContracts group by Vin HAVING MIN(NoContract+0) = 1)  order by vin
select VIN from DealerConnect_VinList where Vin IN (select Vin from DealerConnectContracts group by Vin HAVING MIN(NoContract+0) = 1)  order by vin


select * from DealerConnect_VinList where vin = '1C4BJWDG9JL926168' where Vin NOT IN (select Vin from DealerConnectContracts)  order by vin
select VIN FROM DealerConnect_VinList order by vin
select * from DealerConnectDemog where vin = '1C4PJLCB0HD231849'
select vin, count(*) from DealerConnectDemog group by vin order by count(*) desc

select * from DealerConnectContracts where vin = '1C6RR7KM9HS586680'
select vin, count(*) from DealerConnectContracts group by vin order by count(*) desc
select count(*)  from DealerConnectContracts WHERE NoContract = 1

--Roll Contracts up like this for final results
select Vin, MIN(NoContract+0) AS NoContract -- true and false => false, 1|0=>0
from DealerConnectContracts
group by Vin

select * from DealerConnectContracts   order by vin
select * from DealerConnectDemog   order by vin
select count(*)  from DealerConnectContracts
select count(*)  from DealerConnectDemog
select count(*)  from DealerConnecteighteenKContracts
select count(*)  from DealerConnecteighteenKDemog
--------------------------------------------------------------------------------------------
-- 1C4PJLCB0HD231849 
ALTER view DealerConnectJoin AS
-- select count(*) from DealerConnectJoin 
SELECT distinct dcc.NoContract, dcc.Vin, dc.Row, dc.PurchaseDate, dc.Description, dc.FullName, 
dc.OwnerStatus, dc.Address, dc.City, dc.State, dc.Zip, dc.Phone, dc.emailAddr, dc.Title
FROM ( 
	select Vin, MIN(NoContract+0) AS NoContract -- true and false => false, 1|0=>0
	from DealerConnectContracts
	group by Vin
) dcc
INNER JOIN DealerConnectDemog dc
ON dc.Vin = dcc.Vin
WHERE dcc.NoContract = 1
AND dc.emailAddr IS NOT NULL
AND dc.Title <> '6 - Business'
AND dc.FullName NOT LIKE '%Jeep%'
AND dc.FullName NOT LIKE '%Chrysler%'
AND dc.FullName NOT LIKE '%Ram%'
AND dc.FullName NOT LIKE '%Fiat%'
AND dc.FullName NOT LIKE '%Dodge%'
AND dc.FullName NOT LIKE '%CDJ%'

SELECT distinct dc.emailAddr,
CASE
WHEN FullName LIKE '% %' THEN LEFT(FullName, Charindex(',', FullName) - 1)
ELSE FullName
END,
CASE
WHEN FullName LIKE '% %' THEN RIGHT(FullName, Charindex(',', Reverse(FullName)) - 1)
END
--SELECT distinct dcc.NoContract, dcc.Vin, dc.Row, dc.PurchaseDate, dc.Description, dc.FullName, dc.OwnerStatus, dc.Address, dc.City, dc.State, dc.Zip, dc.Phone, dc.emailAddr, dc.Title
FROM ( 
	select Vin, MIN(NoContract+0) AS NoContract -- true and false => false, 1|0=>0
	from DealerConnecteighteenKContracts
	group by Vin
) dcc
INNER JOIN DealerConnecteighteenKDemog dc
ON dc.Vin = dcc.Vin
WHERE dcc.NoContract = 1
AND dc.emailAddr IS NOT NULL
AND dc.Title <> '6 - Business'
AND dc.FullName NOT LIKE '%Jeep%'
AND dc.FullName NOT LIKE '%Chrysler%'
AND dc.FullName NOT LIKE '%Ram%'
AND dc.FullName NOT LIKE '%Fiat%'
AND dc.FullName NOT LIKE '%Dodge%'
AND dc.FullName NOT LIKE '%CDJ%'
AND dc.FullName NOT LIKE '%Chevrolet%'


-------------------------------------------

select * from DealerConnectContracts   
where message like 'L%'
or    message like 'W%'
or    message like '% - L%'
or    message like '% - W%'
order by vin