package Twitter.Streaming;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import org.bson.Document;

import static java.util.Arrays.asList;

import com.google.common.collect.Lists;
import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.MongoException;
import com.mongodb.ServerAddress;
import com.mongodb.util.JSON;
import com.twitter.hbc.ClientBuilder;
import com.twitter.hbc.core.Client;
import com.twitter.hbc.core.Constants;
import com.twitter.hbc.core.endpoint.StatusesFilterEndpoint;
import com.twitter.hbc.core.processor.StringDelimitedProcessor;
import com.twitter.hbc.httpclient.auth.Authentication;
import com.twitter.hbc.httpclient.auth.OAuth1;


public class TwitterStream {

	public static void main(String[] args) {
		try {
				if(args.length != 14)
				{
					System.out.println("ERROR! Please supply all of the following:");
					System.out.println("\t - Twitter App Consumer Key");
					System.out.println("\t - Twitter App Consumer Secret");
					System.out.println("\t - Twitter App Token");
					System.out.println("\t - Twitter App Secret");
					System.out.println("\t - MongoDB Host Name");
					System.out.println("\t - MongoDB Host Port");
					System.out.println("\t - MongoDB Name");
					System.out.println("\t - MongoDB Collection");
					System.out.println("\t - MongoDB Cache Collection");					
					System.out.println("\t - MongoDB UserName");
					System.out.println("\t - MongoDB Password");
					System.out.println("\t - File containting all keywords (separated by newlines)");
					System.out.println("\t - File containting all keywords to combined the former with (separated by newlines)");
					System.out.println("\t   NOTE: Adding two many cobination keywords could exceed stream's capacity!");
					System.out.println("\t - File containting all single keywords that are tracked on their own (separated by newlines)");
					return;
				}
				
				String consumerKey = args[0];
				String consumerSecret = args[1];
				String token = args[2];
				String secret = args[3];
				String dbHost = args[4];
				String dbPort = args[5];
				String dbName = args[6];
				String dbCollection = args[7];
				String dbCollectionCache = args[8];
				String dbUserName = args[9];
				String dbPassword = args[10];
				String keywordsFile = args[11];
				String combinationKeywordsFile = args[12];
				String singleKeywordsFile = args[13];
				
				System.out.println("Please Note: ");
				
				System.out.println("\t All keywords in file [ " + keywordsFile
						+ " ] will be combined with all keywords in file [ "
						+ combinationKeywordsFile + "].");
				
				System.out.println("\t Additionally, all keywords in file [ "
						+ singleKeywordsFile + " ] will be tracked independently");
				
				System.out.println("\t MongoDB details: ");
				System.out.println("\t\t - Name: " + dbName);
				System.out.println("\t\t - Host: " + dbHost);
				System.out.println("\t\t - Port: " + dbPort);
				System.out.println("\t\t - Collection: " + dbCollection);
				System.out.println("\t\t - Collection Cache: " + dbCollectionCache);
				System.out.println();
				
				System.out.println("Starting Stream...");
				
				TwitterStream.run(consumerKey, consumerSecret, token, secret,
						keywordsFile, combinationKeywordsFile, singleKeywordsFile,
						dbHost, dbPort, dbName, dbCollection, dbCollectionCache,
						dbUserName, dbPassword);

		    } catch (InterruptedException e) {
		      System.out.println(e);
		}

	}
	
	public static List<String> readKeywordsFromFile(String fileName)
	{
		List<String> temp = new ArrayList<String>();
		int numReadKeywords = 0;
		
		try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
		    String line;
		    while ((line = br.readLine()) != null) {
		    	temp.add(line);
		    	++numReadKeywords;
		    }
		} catch (FileNotFoundException e) {
			System.out.println("ERROR: Could not read file [ " + fileName + " ]. File does not exist.");
			e.printStackTrace();
			
		} catch (IOException e) {
			System.out.println("ERROR: Could not read file [ " + fileName + " ].");
			e.printStackTrace();
		}
		
		System.out.println("Successfully read " + numReadKeywords + " from file [ " + fileName + " ]");
		return temp;
	}
	
	public static List<String> createCompoundKeywords(List<String> keywords, List<String> combinationKeywords)
	{
		List<String> temp = new ArrayList<String>();
		for(int i = 0; i < combinationKeywords.size(); ++i)
		{
			for(int c = 0; c < keywords.size(); ++c)
			{
				temp.add(keywords.get(c) + " " + combinationKeywords.get(i));
			}
		}
		return temp;
	}
	
	public static List<String> createKeywords(String keywordsFile, String combinationKeywordsFile, String singleKeywordsFile)
	{
		//Keywords that need to be combined
		List<String> result = new ArrayList<String>();
		
		List<String> keywords = readKeywordsFromFile(keywordsFile);
		List<String> combinationKeywords = readKeywordsFromFile(combinationKeywordsFile);
		List<String> singleKeywords = readKeywordsFromFile(singleKeywordsFile);
		
		result.addAll(createCompoundKeywords(keywords, combinationKeywords));
		result.addAll(singleKeywords);

		System.out.println("Total # of keywords given to stream: " + result.size());
		
		return result;
	}
	
	public static void run(String consumerKey, String consumerSecret, String token, String secret,
			String keywordsFile, String combinationKeywordsFile, String singleKeywordsFile,
			String dbHost, String dbPort, String dbName, String dbCollection, String dbCollectionCache,
			String dbUserName, String dbPassword) throws InterruptedException {
	    // Process Messages
	    try
	    {
	    	//1. Connection to MongoDB
	    	MongoCredential credential = MongoCredential.createCredential(dbUserName, dbName, dbPassword.toCharArray());
	    	
			MongoClient clientMongo1 = new MongoClient(new ServerAddress(dbHost, Integer.parseInt(dbPort)),
					Arrays.asList(credential));
				
			DB db = clientMongo1.getDB(dbName);
				
			DBCollection collection = db.getCollection(dbCollection);
			DBCollection collectionCache = db.getCollection(dbCollectionCache);
			
			//Process in batches of 1m tweets
		    while(true)
		    {
		    	//2. Create Twitter Streaming Client
				BlockingQueue<String> queue = new LinkedBlockingQueue<String>(1000000);
				
			    StatusesFilterEndpoint endpoint = new StatusesFilterEndpoint();
			    // add some track terms
			    endpoint.trackTerms(Lists.newArrayList(createKeywords(keywordsFile, combinationKeywordsFile, singleKeywordsFile)));
			    
			    Authentication auth = new OAuth1(consumerKey, consumerSecret, token, secret);
			    
			    StringDelimitedProcessor delimiterProcessor = new StringDelimitedProcessor(queue);
			    //Authentication auth = new BasicAuth(username, password);
			    System.out.println("Creating Client...");
			    // Create a new BasicClient. By default gzip is enabled.
			    ClientBuilder clientbuilder = new ClientBuilder()
					    .name("Twitter Client")        
			            .hosts(Constants.STREAM_HOST)
					    .endpoint(endpoint)
			           .authentication(auth)
			           .processor(delimiterProcessor);
			    
			    Client client = clientbuilder.build();

			    System.out.println("Connecting to Client...");
			    
			    // Establish a connection
			    client.connect();
			    
			    //3. Process Batch of tweets
			    for (int msgRead = 0; msgRead < 1000000; ++msgRead) {
			    	
			        String msg = queue.take();
			        
					// convert JSON to DBObject directly
					DBObject dbObject = (DBObject) JSON.parse(msg);
					
					collection.insert(dbObject);
					
					//to increment cache collection of number of tweets as new tweet is being fed in
					String timestamp =  (String) dbObject.get("timestamp_ms");
					Calendar cal = Calendar.getInstance();
					cal.setTimeInMillis(Long.parseLong(timestamp));
					cal.set(Calendar.HOUR_OF_DAY, 0);
					cal.set(Calendar.MINUTE, 0);
					cal.set(Calendar.SECOND, 0);
					cal.set(Calendar.MILLISECOND, 0);
					long _id = cal.getTimeInMillis();
					
					BasicDBObject newDocument = new BasicDBObject().append("$inc", new BasicDBObject().append("value", 1));
					collectionCache.update(new BasicDBObject().append("_id", _id), newDocument,true,false);
					
					
					System.out.println("Added Tweet : [" + msg.substring(0, 20) + " ... ].");
			    }
			    
			    client.stop();
		    }
	    } catch (MongoException e) {
			e.printStackTrace();
		}
	    catch(Exception e)
	    {
	    	System.out.println("An Error occured during streaming, shutting down Client...");
	    	e.printStackTrace();
	    }
	  }
	}