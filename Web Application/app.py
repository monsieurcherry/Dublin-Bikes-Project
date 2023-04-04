from flask import Flask, g, jsonify, render_template
import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import functools
import config
import pandas as pd
from json import loads, dumps

app = Flask(__name__)

URI = "dbbikes.cfjfzkae45jy.eu-west-1.rds.amazonaws.com"
PORT="3306"
DB="dbbikes"
USER="admin"
PASSWORD = config.DB_PASSWORD

def connect_to_database():
    engine = create_engine("mysql+mysqlconnector://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
    return engine

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route("/stations")
@functools.lru_cache(maxsize=128)
def get_stations():
    engine = get_db()
    sql = "select * from station;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(sqla.text(sql)).fetchall()
            print('#found {} stations', len(rows), rows)
            conn.close()
            return jsonify([row._asdict() for row in rows])

    except:
        print(traceback.format_exc())
        return "error in get_stations", 404


@app.route("/currentstations")
@functools.lru_cache(maxsize=128)
def get_current_stations_info():
    engine = get_db()
    sql = "select * from currentavailability;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(sqla.text(sql)).fetchall()
            print('#found {} stations', len(rows), rows)
            conn.close()
            return jsonify([row._asdict() for row in rows])


    except:
        print(traceback.format_exc())
        return "error in current stations", 404

@app.route("/currentweather")
@functools.lru_cache(maxsize=128)
def get_current_weather_info():
    engine = get_db()
    sql = "select * from currentweather;"
    try:
        with engine.connect() as conn:
            rows = conn.execute(sqla.text(sql)).fetchall()
            print('#found {} weather info', len(rows), rows)
            conn.close()
            return jsonify([row._asdict() for row in rows])
    except:
        print(traceback.format_exc())
        return "error in current weather", 404



@app.route("/station_avg_data/<int:station_id>")
@functools.lru_cache(maxsize=128)
def station_avg_data(station_id):
    engine = get_db()
    try:
        with engine.connect() as connection:
            df = pd.read_sql_table("availability", connection)
            print(df)
            df = df[df['number'] == station_id]
            df = df.drop_duplicates(keep='first')
            df['last_update'] = pd.to_datetime(df['last_update'])
            df = df.set_index('last_update')
            df = df.resample('10T').mean()
            df = df.groupby(df.index.hour).mean()
            result = df['available_bikes'].to_json(orient="split")
            parsed = loads(result)
            # connection.close()
            return dumps(parsed, indent=4)

    except:
        print(traceback.format_exc())
        return "error in station availability", 404
    
    

@app.route("/")
def render():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, port=5500)
