const express =require("express");
const cors =require("cors");
const { Transaction } = require("./db/db");
const  axios  = require("axios");
const { API_1_URL, API_2_URL, API_3_URL } = require("./config");
const PORT = 4000 || process.env.PORT

const app = express()

app.use(cors())

app.get('/seed-db', async(req , res)=> {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;
    
        const transactionData = transactions.map(transaction => ({
            id: transaction.id,
            title: transaction.title,
            price: transaction.price,
            description: transaction.description,
            category: transaction.category,
            image: transaction.image,
            sold: transaction.sold,
            dateOfSale: new Date(transaction.dateOfSale),
          }));
         
          await Transaction.insertMany(transactionData);
    
        res.status(200).json('Database initialized with seed data');
      } catch (error) {
        console.error(error);
        res.status(500).json('Error initializing database');
    }
})

app.get('/transactions', async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
  
    if (month && (month < 1 || month > 12)) {
      return res.status(400).json('Invalid month input. Please provide a number between 1 and 12.');
    }
  
    try {
      const filter = {};

     if (month) {
        console.log(month);
        filter.$expr = { $eq: [{ $month: "$dateOfSale" }, Number(month)] }; //Extract and compare
      }
  
    
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      
        if (!isNaN(search)) {
          filter.price = Number(search);
        }
      }
  
     console.log(filter);
     
      const transactions = await Transaction.find(filter)
        .skip((page - 1) * perPage) 
        .limit(Number(perPage));    
  
      const totalTransactions = await Transaction.countDocuments(filter);
  
      res.status(200).json({
        transactions,
        total: totalTransactions,
        page,
        perPage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json('Error fetching transactions');
    }
  });

app.get('/statistics', async (req, res) => {
    const { month } = req.query;
  
    
    if (month && (month < 1 || month > 12)) {
      return res.status(400).json('Invalid month input. Please provide a number between 1 and 12.');
    }
  
    try {
      const filter = {};
  
      if (month) {
        filter.$expr = { $eq: [{ $month: "$dateOfSale" }, Number(month)] };
      }
  
      const totalSales = await Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: "$price" } } }
      ]);
  
      console.log(totalSales); //[ { _id: null, totalAmount: 4959.84 } ]

      const totalSoldItems = await Transaction.aggregate([
        { $match: { ...filter, sold: true } },
        { $count: "soldItems" }
      ]);

      console.log(totalSoldItems); //[ { soldItems: 2 } ]
      

      const totalNotSoldItems = await Transaction.aggregate([
        { $match: { ...filter, sold: false } },
        { $count: "notSoldItems" }
      ]);

      console.log(totalNotSoldItems); //[ { notSoldItems: 1 } ]
  
      res.status(200).json({
        totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
        totalSoldItems: totalSoldItems.length > 0 ? totalSoldItems[0].soldItems : 0,
        totalNotSoldItems: totalNotSoldItems.length > 0 ? totalNotSoldItems[0].notSoldItems : 0
      });
    } catch (error) {
      console.error(error);
      res.status(500).json('Error fetching statistics');
    }
  });

// app.get('/statistics', async (req, res) => {
//     const { month } = req.query;
  
//     
//     if (month && (month < 1 || month > 12)) {
//       return res.status(400).json('Invalid month input. Please provide a number between 1 and 12.');
//     }
  
//     try {
//       const filter = {};
  
//       if (month) {
//         filter.$expr = { $eq: [{ $month: "$dateOfSale" }, Number(month)] };
//       }
  
//     
//       const transactions = await Transaction.find(filter);
  
//     
//       const totalSales = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
  
//       
//       const totalSoldItems = transactions.filter(transaction => transaction.sold).length;
  
//      
//       const totalNotSoldItems = transactions.filter(transaction => !transaction.sold).length;
  
//       res.status(200).json({
//         totalSales,
//         totalSoldItems,
//         totalNotSoldItems
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json('Error fetching statistics');
//     }
//   });
  

app.get('/price-range-statistics', async (req, res) => {
    const { month } = req.query; 

    if (month < 1 || month > 12) {
      return res.status(400).json('Month must be between 1 and 12');
    }
  
    try {
       
      const filter = {};

      if (month) {
        filter.$expr = { $eq: [{ $month: "$dateOfSale" }, Number(month)] }; 
      } 
  
      const transactions = await Transaction.find(filter);
  
      // price ranges
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901+', min: 901, max: Infinity }
      ];
  

      const rangeCounts = priceRanges.map(priceRange => ({
        range: priceRange.range,
        count: 0
      }));

      console.log(rangeCounts);
      
      transactions.forEach(transaction => {
        const price = transaction.price;
        priceRanges.forEach(priceRange => {
          if (price >= priceRange.min && price <= priceRange.max) {
            
            rangeCounts.find(r => r.range === priceRange.range).count++;
          }
        });
      });
  
      res.json({
        month,
        priceRangeStatistics: rangeCounts
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json('Error fetching data');
    }
  });

app.get('/category-pie-chart', async (req, res) => {
    const { month } = req.query; 
  
    if (month < 1 || month > 12) {
      return res.status(400).json('Month must be between 1 and 12');
    }
  
    try {
     
      const filter = {};

      if (month) {
        filter.$expr = { $eq: [{ $month: "$dateOfSale" }, Number(month)] }; 
      } 


      const transactions = await Transaction.find(filter);
  
      const categoryCounts = {};
  
      transactions.forEach(transaction => {
        const category = transaction.category;
        if (categoryCounts[category]) {
          categoryCounts[category]++;
        } else {
          categoryCounts[category] = 1;
        }
      });

      console.log(categoryCounts);
      
      
      const arrayOfCategory = Object.keys(categoryCounts) //["electronics", "clothing"]

      const categoryData = arrayOfCategory.map(category => ({
        category,
        count: categoryCounts[category]
      }));

      console.log(categoryData);
  
      
      res.json({
        month,
        pieChartData: categoryData
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json('Error fetching data');
    }
});
  

app.get('/combined-data', async (req, res) => {
  try {
   
    const [statsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get(API_1_URL, { params: req.query }), 
      axios.get(API_2_URL, { params: req.query }),  
      axios.get(API_3_URL, { params: req.query }), 
    ]);

  
    const combinedData = {
      month : req.query,
      statistics: statsResponse.data,
      barChartData: barChartResponse.data,
      pieChartData: pieChartResponse.data,
    };

    
    res.json(combinedData);

  } catch (error) {
    console.error('Error fetching data from APIs:', error);
    res.status(500).json({ message: 'Error fetching combined data', error: error.message });
  }
});

//ALL CATCH
app.all('*' , (req,res)=>{
    res.status(404).json({
        message : 'Route is not found'
    })
})

app.listen(PORT , ()=>{
    console.log(`server is listening on port ${PORT}`);
})