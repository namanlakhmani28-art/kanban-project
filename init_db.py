import mysql.connector 
from config import Config



def init_db():
    #Connect without specifying database first to allow Create database
    conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD, 
        port=Config.MYSQL_PORT
    )
    cursor = conn.cursor()


    print("Reading schema.sql...")
    with open('schema.sql', 'r') as f:
        sql_content = f.read()

    print("Executing schema...")
    try: 
        raw_statements = sql_content.split(';')


        for statement in raw_statements:
            lines = [
                line.split('--')[0].strip()
                for line in statement.splitlines()
                if line.strip() and not line.strip().startswith('--')
            ]
            stmt = ' '.join(lines).strip()



            if stmt:
                cursor.execute(stmt)


                if stmt.lower().startswith('use '):
                    db_name = stmt.split()[1].rstrip(';')
                    conn.database = db_name


        conn.commit()
        print("Database and tables initialized successfully with seed data!")
    except Exception as e:
        print(f"Error executing schema: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    init_db()



