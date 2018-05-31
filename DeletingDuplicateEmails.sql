--testing for dupes:
select emailAddr,FirstName, LastName, FullName, COUNT(*)  
from DealerConnectEmailList 
GROUP BY emailAddr,FirstName, LastName, FullName 
HAVING COUNT(*) > 1

select emailAddr, COUNT(*)  
from DealerConnectEmailList 
GROUP BY emailAddr 
HAVING COUNT(*) > 1

--back that thang up
select * into _tmpemail
from DealerConnectEmailList 

-------------------------------------------------
SELECT *
-- DELETE DealerConnectEmailList 
FROM DealerConnectEmailList
LEFT OUTER JOIN (
   SELECT MIN(ID) as ID, emailAddr
   FROM DealerConnectEmailList 
   GROUP BY emailAddr
) as KeepRows ON
   DealerConnectEmailList.ID = KeepRows.ID
WHERE
   KeepRows.ID IS NULL

-- now how many do we have?
SELECT DownloadDate, COUNT(*) from DealerConnectEmailList GROUP BY DownloadDate

go

-- ExportEmails
create view _dcexp as 
select emailAddr from DealerConnectEmailList where DownloadDate = '5/30/2018'

select * from _dcexp
drop view _dcexp

