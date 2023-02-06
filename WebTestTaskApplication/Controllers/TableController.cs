using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using WebTestTaskApplication.Models;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace WebTestTaskApplication.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class TableController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<TableModel> Get()
        {
            List<TableModel> TableModels = new List<TableModel>();

            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            try
            {
                connection.Open();
                string queryString =
                    "SELECT UsersTools.ID,ToolName,CountPerUser,UserName FROM Tools,Users,UsersTools\r\n" +
                    "WHERE UsersTools.ToolID = Tools.ID AND UsersTools.UserID = Users.ID\r\n" +
                    "ORDER BY UsersTools.ID";


                SqlCommand command =
                    new SqlCommand(queryString, connection);

                SqlDataReader reader = command.ExecuteReader();

                // Call Read before accessing data.
                int i = 0;
                while (reader.Read())
                {
                    TableModels.Add(new TableModel
                    {
                        ID = reader.GetInt32(0),
                        ToolName = reader.GetString(1),
                        CountPerUser = reader.GetInt32(2),
                        UserName = reader.GetString(3),
                    });

                }


                // Call Close when done reading.
                reader.Close();

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }


            return TableModels.ToArray();
        }



        [HttpGet("getusers")]
        public IEnumerable<UserModel> GetUsers()
        {
            List<UserModel> users = new List<UserModel>();

            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            try
            {
                connection.Open();
                string queryString =
                    "SELECT ID, UserName FROM Users";


                SqlCommand command =
                    new SqlCommand(queryString, connection);

                SqlDataReader reader = command.ExecuteReader();

                // Call Read before accessing data.
                
                while (reader.Read())
                {
                    users.Add(new UserModel
                    {
                        ID = reader.GetInt32(0),
                        UserName = reader.GetString(1),
                    });

                }


                // Call Close when done reading.
                reader.Close();

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }


            return users.ToArray();
        }



        [HttpGet("gettools")]
        public IEnumerable<ToolModel> GetTools()
        {
            List<ToolModel> tools = new List<ToolModel>();
            List<UsersToolsModel> toolsPerUsers = new List<UsersToolsModel>();

            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            try
            {
                connection.Open();
                string queryString1 =
                    "SELECT ID, ToolName, Count FROM Tools";

                string queryString2 =
                    "SELECT ToolID, CountPerUser FROM UsersTools";


                SqlCommand command =
                    new SqlCommand(queryString1, connection);

                SqlDataReader reader = command.ExecuteReader();

                // Call Read before accessing data.
                
                while (reader.Read())
                {
                    tools.Add(new ToolModel
                    {
                        ID = reader.GetInt32(0),
                        ToolName = reader.GetString(1),
                        Count = reader.GetInt32(2),
                    });

                }


                // Call Close when done reading.
                reader.Close();

                command = new SqlCommand(queryString2, connection);

                reader = command.ExecuteReader();

                // Call Read before accessing data.
                
                while (reader.Read())
                {
                    toolsPerUsers.Add(new UsersToolsModel
                    {
                        ToolID = reader.GetInt32(0),
                        CountPerUser = reader.GetInt32(1),
                    });

                }



                // Call Close when done reading.
                reader.Close();

                int toolID = 0;
                int toolCount = 0;

                for(int i=0;i<toolsPerUsers.Count;i++)
                {
                    toolID = toolsPerUsers[i].ToolID;
                    toolCount = toolsPerUsers[i].CountPerUser;
                    for (int j=0;j < tools.Count;j++)
                    {
                        if (toolID == tools[j].ID)
                        {
                            tools[j].Count -= toolCount;
                            break;
                        }

                    }
                }

                

                for (int i = 0; i < tools.Count; )
                {
                    if (tools.ElementAt(i).Count < 1)
                        tools.RemoveAt(i);
                    else
                        i++;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }


            return tools.ToArray();
        }


        [HttpDelete("{id}")]
        public IActionResult Delete(int? Id)
        {
            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            try
            {
                connection.Open();
                string queryString =
                    "DELETE FROM UsersTools\r\n" +
                    $"WHERE UsersTools.ID = {Id} \r\n";


                SqlCommand command =
                    new SqlCommand(queryString, connection);

                SqlDataReader reader = command.ExecuteReader();

                // Call Close when done reading.
                reader.Close();

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            return NoContent();
        }

        [HttpPut]
        public IActionResult updateRecord(UsersToolsModel deletedRow)
        {
            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            try
            {
                connection.Open();
                string queryString =
                    $"UPDATE UsersTools SET CountPerUser = {deletedRow.CountPerUser}" +
                    $"\r\nWHERE UsersTools.ID = {deletedRow.ID}";


                SqlCommand command =
                    new SqlCommand(queryString, connection);

                SqlDataReader reader = command.ExecuteReader();

                // Call Close when done reading.
                reader.Close();

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            return NoContent();
        }

        [HttpPost("create")]
        public IActionResult Create(UsersToolsModel addedrow)
        {
            //UsersToolsModel newrecord = JsonConvert.DeserializeObject<UsersToolsModel>(value);
            string sqlPath = "Data Source=(local); Database=TestDB; Persist Security Info=false; MultipleActiveResultSets=True; Trusted_Connection=True;";
            //string sqlUser = "user1;sa";
            SqlConnection connection = new SqlConnection(sqlPath);
            
            if(addedrow != null)
            {
                if(addedrow.CountPerUser!=0&& addedrow.UserID!=0 &&addedrow.ToolID!=0)
                {
                    try
                    {
                        connection.Open();
                        string queryString =
                            $"INSERT UsersTools(UserID,ToolID,CountPerUser) VALUES" +
                            $"\r\n({addedrow.UserID},{addedrow.ToolID},{addedrow.CountPerUser})";

                        SqlCommand command =
                            new SqlCommand(queryString, connection);

                        SqlDataReader reader = command.ExecuteReader();

                        // Call Close when done reading.
                        reader.Close();

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.ToString());
                    }
                }
            }

            return NoContent();
        }

    }
}
