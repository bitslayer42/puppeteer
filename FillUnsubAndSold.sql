
CREATE PROC FillUnsubAndSold AS

-- Unsubscribed: imported from email service
UPDATE email SET Unsubscribed = 1
-- select Unsubscribed
FROM DealerConnectEmailList email
INNER JOIN DealerConnectUnsubscribed unsub
ON email.emailAddr = unsub.EmailAddress

-- finding sold cars - dont send any more emails
UPDATE email SET SoldWarranty = 1
-- select SoldWarranty
FROM DealerConnectEmailList email
INNER JOIN (
	select DISTINCT emailAddr from DealerConnectDemog where vin in (
		select vin from deals where warrantysale = 1
	)
) AS sold
ON email.emailAddr = sold.emailAddr
