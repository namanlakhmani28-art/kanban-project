from flask import Flask, render_template, jsonify, request
import mysql.connector
from config import Config


app = Flask(__name__)
app.config.from_object(Config)


def get_db_connection():
    return mysql.connector.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        database=app.config['MYSQL_DB'],
        port=app.config['MYSQL_PORT']
    )


@app.route('/')
def index():
    return render_template('index.html')


# Get all columns
@app.route('/api/board', methods=['GET'])
def get_board():
    conn = get_db_connection()
    try: 
        cursor = conn.cursor(dictionary=True)


        cursor.execute("SELECT * FROM columns ORDER BY position ASC")
        columns = cursor.fetchall()

        cursor.execute("SELECT * FROM tasks ORDER BY column_id ASC, position ASC")
        tasks = cursor.fetchall()

        for col in columns:
            col['tasks'] = [t for t in tasks if t['column_id'] == col['id']]

        return jsonify({'columns': columns})
    finally:
        cursor.close()
        conn.close()




# Create a new task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json() or {}
    title = data.get('title', '').strip()



    if not title:
        return jsonify({'error': 'Title is required'}), 400




    conn = get_db_connection()

    try: 
        cursor = conn.cursor()
        column_id = data.get('column_id', 1)
        cursor.execute("SELECT COALESCE(MAX(position), -1) +1 FROM tasks WHERE column_id = %s", (column_id,))
        next_pos = cursor.fetchone()[0]

        sql = """
        INSERT INTO tasks (title, description, column_id, burst_time, priority, position)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (
            title, 
            data.get('description', ''),
            column_id,
            data.get('burst_time', 1), 
            data.get('priority', 1),
            next_pos
        )


        cursor.execute(sql, values)
        conn.commit()
        return jsonify({'message': 'Task created', 'id': cursor.lastrowid}), 201
    finally:
        cursor.close()
        conn.close()



# Update task position/column
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json() or {}

    conn = get_db_connection()
    try: 
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
        existing_task = cursor.fetchone()

        if not existing_task:
            return jsonify({'error': 'Task not found'}), 404



        column_id = data.get('column_id', existing_task['column_id'])
        position = data.get('position', existing_task['position'])
        title = data.get('title', existing_task['title'])
        description = data.get('description', existing_task['description'])
        burst_time = data.get('burst_time', existing_task['burst_time'])

        priority = data.get('priority', existing_task['priority'])
                               


        sql = """
        UPDATE tasks
        SET column_id = %s, position =%s, title = %s, description = %s, burst_time = %s, priority = %s
        WHERE id = %s
        """

        cursor.execute(sql, (column_id, position, title, description, burst_time, priority, task_id))

        conn.commit()
        return jsonify({'message': 'Task updated successfully'})
    finally:
        cursor.close()
        conn.close()



# Delete a task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    try: 
        cursor = conn.cursor()


        cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))


        conn.commit()
        return jsonify({'message': 'Task deleted'})
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)






