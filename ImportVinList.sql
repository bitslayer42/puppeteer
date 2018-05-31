INSERT INTO [dbo].[DealerConnect_VinList]
           ([vin]
           ,[year]
           ,[make]
           ,[model]
           ,[state]
           ,[miles]
           ,[days_unseen]
           ,[days_seen]
           ,[first_seen]
           ,[last_seen]
           ,[max_unseen_gap]
           ,[seen_dates])
SELECT [vin]
      ,[year]
      ,[make]
      ,[model]
      ,[state]
      ,[miles]
      ,[days_unseen]
      ,[days_seen]
      ,[first_seen]
      ,[last_seen]
      ,[max_unseen_gap]
      ,[seen_dates]
  FROM [dbo].[dealcon]
GO




