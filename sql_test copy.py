import pymysql

# MySQL 연결 설정
conn = pymysql.connect(host="127.0.0.1", user="root", password="Mulzomdao2", db="MyDB")

# 커서 생성
cursor = db.cursor()

# Create (데이터 생성)
def create_data():
    sql = "INSERT INTO users (name, email) VALUES (%s, %s)"
    values = ("John Doe", "johndoe@example.com")
    cursor.execute(sql, values)
    db.commit()
    print("Data created successfully.")

# Read (데이터 읽기)
def read_data():
    sql = "SELECT * FROM users"
    cursor.execute(sql)
    result = cursor.fetchall()
    for row in result:
        print(row)

# Update (데이터 수정)
def update_data():
    sql = "UPDATE users SET email = %s WHERE name = %s"
    values = ("newemail@example.com", "John Doe")
    cursor.execute(sql, values)
    db.commit()
    print("Data updated successfully.")

# Delete (데이터 삭제)
def delete_data():
    sql = "DELETE FROM users WHERE name = %s"
    values = ("John Doe",)
    cursor.execute(sql, values)
    db.commit()
    print("Data deleted successfully.")

# 기능 호출
create_data()
read_data()
update_data()
read_data()
delete_data()
read_data()

# MySQL 연결 종료
db.close()