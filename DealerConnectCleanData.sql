with main AS (
	SELECT title,
	emailAddr,
	LEFT(FirstMiddleName, Charindex(' ', FirstMiddleName) - 1) AS FirstName,
	LastName,
	FullName
	FROM (
		SELECT distinct
		 dc.Title , dc.emailAddr,FullName,
		CASE WHEN FullName LIKE '%,%' THEN LEFT(FullName, Charindex(',', FullName) - 1)
		ELSE FullName
		END AS LastName ,
		CASE WHEN FullName LIKE '%,%' THEN RIGHT(FullName, Charindex(',', Reverse(FullName)) - 2)
		END AS FirstMiddleName
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
		AND NOT (
				dc.FullName LIKE '%Jeep%'
				OR dc.FullName LIKE '%Chrysler%'
				OR '#'+dc.FullName+'#' like '%[^a-z0-9]Ram[^a-z0-9]%'
				OR dc.FullName LIKE '%Fiat%'
				OR dc.FullName LIKE '%Dodge%'
				OR dc.FullName LIKE '%CDJ%'
				OR dc.FullName LIKE '%C D J%'
				OR dc.FullName LIKE '%CJD%'
				OR dc.FullName LIKE '%C J D%'
				OR dc.FullName LIKE '%Chevrolet%'
				OR '#'+dc.FullName+'#' like '%[^a-z0-9]FORD[^a-z0-9]%'
				OR dc.FullName LIKE '%MOTOR%'
				OR dc.FullName LIKE '%AUTO%'
				OR dc.FullName LIKE '%MITSUBISHI%'
				OR dc.FullName LIKE '%VOLKSWAGEN%'
				OR dc.FullName LIKE '%HYUNDAI%'
				OR dc.FullName LIKE '%ALFA RO%'
				OR dc.FullName LIKE '%AUTOMOTIVE%'

				OR dc.FullName LIKE '%LIMOUSINE%'
				OR dc.FullName LIKE '%LEASING%'
				OR dc.FullName LIKE '%TIRE CENTER%'
				OR dc.FullName LIKE '%AMANDA MATT CHRISTINE LEONARD GERWEL, ERWEL%'
				OR dc.FullName LIKE '%LLC%'
				OR dc.FullName LIKE '%INC%'
				OR dc.FullName LIKE '%HEALTHCARE%'
				OR dc.FullName LIKE '%NURSING%'
				OR dc.FullName LIKE '%FITNESS%'
				OR dc.FullName LIKE '%CONSTRUCTION%'
				OR dc.FullName LIKE '%LAWN MAINT%'
				OR dc.FullName LIKE '%NEW VEH%'
				OR dc.FullName LIKE '%ELECTRONIC%'
				OR dc.FullName LIKE '%ENTERPR%'
				OR dc.FullName LIKE '%ROOFING%'								
				OR dc.FullName LIKE '%STATE OF%'								
				OR dc.FullName LIKE '%HEATING%'								
				OR dc.FullName LIKE '%INSURAN%'								
				OR dc.FullName LIKE '%BUREAU%'								
				OR dc.FullName LIKE '%ENGINEER%'
				OR dc.FullName LIKE '%HOME CENTER%'
			)
	) AS inr
) --select distinct emailAddr, FullName, count(*) from main group by emailAddr, FullName having count(*) > 1


select distinct TITLE,main.emailAddr, FirstName, LastName, FullName, LEN(FullName) from main
inner join (
	select distinct emailAddr, MAX(FullName) As MaxName from main group by emailAddr
) As mxnm
ON main.emailAddr = mxnm.emailAddr
AND main.FullName = mxnm.MaxName
order by LEN(FullName) desc
