from flask import Flask, redirect, url_for, render_template, jsonify, request
import sklearn
from sklearn.preprocessing import StandardScaler
from sklearn import metrics
from sklearn.manifold import MDS
import pandas as pd
import json
from sklearn.cluster import KMeans

app = Flask(__name__)

data = pd.read_csv('data/final2.csv')

@app.route("/barchart/top10county")
def get_top10county():
    global data

    top10bestcounty = []
    top10worstcounty = []

    sorted_data = data.sort_values("final_score")

    top10rows = sorted_data[-10:]
    worst10rows = sorted_data[:10]
    top10bestcounty = []
    top10worstcounty = []

    top10data = {}

    for index, row in top10rows.iterrows():
        top10bestcounty.append({row['county']:row['final_score']})

    for index, row in worst10rows.iterrows():
        top10worstcounty.append({row['county']:row['final_score']})

    #top10data["top10bestcounty"] = top10bestcounty
    #top10data["top10worstcounty"] = top10worstcounty

    #print(top10data)


    return jsonify(top10=top10bestcounty, worst10=top10worstcounty)

@app.route('/mds_variable')
def mds_variable():
    global data

    # Only keep numerical columns
    '''cat_attri = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
                 'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
                 'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
                 'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
                 'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
                 'percent_no_highschool_diploma_score','education_avg_score','final_score']'''
    
    cat_attri = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score', 'percent_frequent_physical_distress',
                 'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
                 'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
                 'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
                 'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
                 'percent_no_highschool_diploma_score','education_avg_score','final_score']
    X = data[data.columns.difference(cat_attri)]
    #X = data
    
    # MDS (1 - |Correlation| distance)
    # Correlation MDS
    mds_corr = MDS(n_components=2, dissimilarity='precomputed')
    X = data[data.columns.difference(cat_attri)]
    X_std = StandardScaler().fit_transform(X)
    mds_data = pd.DataFrame(X_std)

    corr_matrix = mds_data.corr()


    corr_dist_matrix = pd.DataFrame()

    for column in corr_matrix.columns:
        corr_dist_matrix[column] = 1 - abs(corr_matrix[column].values[:])

    corr_dist_matrix_transformed = mds_corr.fit_transform(corr_dist_matrix)

    x = corr_dist_matrix_transformed[:, 0].tolist()
    y = corr_dist_matrix_transformed[:, 1].tolist()
    cols = X.columns.tolist()


    return jsonify(x=x, y=y, cols=cols)

@app.route("/usmapdata", methods=["GET"])
def sendUSMapData():
    with open("data/us.json", "r") as read_file:
        map_json = json.load(read_file)
    return map_json

@app.route("/countyStateCode", methods=["GET"])
def sendCountyStateCode():
    data = pd.read_csv("data/county_state_code.csv")
    fips = data['fips'].tolist()
    name = data['name'].tolist()
    state = data['state'].tolist()
    return jsonify(fips=fips,name=name,state=state)

@app.route("/stateCode", methods=["GET"])
def sendStateCode():
    data = pd.read_csv("data/state.csv")
    fips = data['STATE_FIPS'].tolist()
    name = data['STATE_NAME'].tolist()
    return jsonify(fips=fips,name=name)

@app.route("/pcpdata", methods=["GET"])
def getPCPData():
    cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
                 'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
                 'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
                 'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
                 'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
                 'percent_no_highschool_diploma_score','education_avg_score','final_score']
    # cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
    #              'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
    #              'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
    #              'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
    #              'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
    #              'percent_no_highschool_diploma_score','education_avg_score','final_score', 'total_population', 'life_expectancy',
    #              'percent_frequent_physical_distress', 'percent_adults_with_obesity', 'percent_frequent_mental_distress', 
    #              'percent_insufficient_sleep', 'percent_homeowners', 'percent_below_poverty', 'percent_unemployed_CDC',
    #              'percent_severe_housing_cost_burden', 'percent_limited_access_to_healthy_foods']
    numericalDF = data.drop(cols_to_remove, axis=1)  # Remove not required columns
    # Data Standardization
    X_std = StandardScaler().fit_transform(numericalDF)
    kmeans = KMeans(n_clusters= 2)
    kmeans.fit(X_std)
    cluster_values = kmeans.labels_
    #print(numericalDF.columns.tolist())

    # [, 'percent_fair_or_poor_health', , 'per_capita_income', 
    #  , 'percent_limited_access_to_healthy_foods', 
    #  , 'percent_no_highschool_diploma', 'high_school_graduation_rate', 'percent_vaccinated']

    my_df = pd.DataFrame(numericalDF, columns=numericalDF.columns.tolist())
    my_df['cluster'] = cluster_values
    pcp_data = my_df
    #print(pcp_data)
    pcp_data = json.dumps(pcp_data.to_dict(orient='records'), indent=2)
    pcp_data = {'pcpData': pcp_data}
    return jsonify(pcp_data)

@app.route('/countydata')
def countydata():
    global data

    received_name = request.args.get('county')

    county_data = []

    for index, row in data.iterrows():
         if row['county'] == received_name:
            county_data.append({"Health":row['health_score']})
            county_data.append({"Quality of Life":row['qol_score']})
            county_data.append({"Wealth":row['wealth_avg_score']})
            county_data.append({"Education":row['education_avg_score']})
            break

    return jsonify(county_data = county_data, county_name = received_name)

@app.route('/featuredata')
def featuredata():
    global data

    received_name = request.args.get('feature')

    feature_data = data[['county', received_name]]

    top10bestcountyfeature = []
    top10worstcountyfeature = []

    feature_data = feature_data.sort_values(received_name)

    top10rows = feature_data[-10:]
    worst10rows = feature_data[:10]

    for index, row in top10rows.iterrows():
        top10bestcountyfeature.append({row['county']:row[received_name]})

    for index, row in worst10rows.iterrows():
        top10worstcountyfeature.append({row['county']:row[received_name]})

    return jsonify(top10bestcountyfeature=top10bestcountyfeature, top10worstcountyfeature=top10worstcountyfeature)


@app.route('/brushfeaturedata')
def brushfeaturedata():
    global data

    received_lst = request.args.get('featurelist')
    received_lst = received_lst.split(" ")

    #print("LISTTTTTTTTTTTTTTT")

    #print(received_lst)

    received_name = received_lst[0]
    range_low = float(received_lst[1])
    range_high = float(received_lst[2])

    #print(received_name, range_low, range_high)

    feature_data = data[['county', received_name]]

    feature_data = feature_data[(feature_data[received_name] > range_low) & (feature_data[received_name] < range_high)]
    
    #print(feature_data)

    top10bestcountyfeaturebrushed = []
    top10worstcountyfeaturebrushed = []

    feature_data = feature_data.sort_values(received_name)

    if(len(feature_data)>10):

        top10rows = feature_data[-10:]
        worst10rows = feature_data[:10]

    else:
        top10rows = feature_data[:]
        worst10rows = feature_data[:]


    for index, row in top10rows.iterrows():
        top10bestcountyfeaturebrushed.append({row['county']:row[received_name]})

    for index, row in worst10rows.iterrows():
        top10worstcountyfeaturebrushed.append({row['county']:row[received_name]})

    return jsonify(top10bestcountyfeaturebrushed=top10bestcountyfeaturebrushed, top10worstcountyfeaturebrushed=top10worstcountyfeaturebrushed)

@app.route('/brushboxdata')
def brushboxdata():
    global data

    received_lst = request.args.get('featurelist')
    received_lst = received_lst.split(" ")

    #print("LISTTTTTTTTTTTTTTT")

    #print(received_lst)

    received_name = received_lst[0]
    range_low = float(received_lst[1])
    range_high = float(received_lst[2])

    #print(received_name, range_low, range_high)

    feature_data = data[['county', received_name, 'health_score', 'qol_score', 'wealth_avg_score', 'education_avg_score']]

    feature_data = feature_data[(feature_data[received_name] > range_low) & (feature_data[received_name] < range_high)]
    
    #print(feature_data)

    sorted_health_data = feature_data.sort_values("health_score")
    sorted_qol_data = feature_data.sort_values("qol_score")
    sorted_wealth_data = feature_data.sort_values("wealth_avg_score")
    sorted_education_data = feature_data.sort_values("education_avg_score")

    health_data = []
    qol_data = []
    wealth_data = []
    education_data = []


    for index, row in sorted_health_data.iterrows():
        health_data.append({row['county']:row['health_score']})

    for index, row in sorted_qol_data.iterrows():
        qol_data.append({row['county']:row['qol_score']})

    for index, row in sorted_wealth_data.iterrows():
        wealth_data.append({row['county']:row['wealth_avg_score']})

    for index, row in sorted_education_data.iterrows():
        education_data.append({row['county']:row['education_avg_score']})


    return jsonify(health = health_data, qol = qol_data, wealth = wealth_data, education = education_data)






@app.route('/statedata')
def statedata():
    global data

    received_name = request.args.get('state')

    top10instate = []
    #top10instatevals = []
    worst10instate = []
    #worst10instatevals = []

    desc_sorted_data = data.sort_values("final_score", ascending=False)

    i = 0

    for index, row in desc_sorted_data.iterrows():
         if row['state'] == received_name and i < 10:
            top10instate.append({row['county']:row['final_score']})
            #top10instate.append(row['county'])
            #top10instatevals.append(row['final_score'])
            i += 1

    asc_sorted_data = data.sort_values("final_score", ascending=True)

    i = 0

    for index, row in asc_sorted_data.iterrows():
         if row['state'] == received_name and i < 10:
            worst10instate.append({row['county']:row['final_score']})
            #worst10instate.append(row['county'])
            #worst10instatevals.append(row['final_score'])
            i += 1

    return jsonify(top10instate = top10instate,  worst10instate = worst10instate)

@app.route('/statedataPCP')
def statedataPCP():
    global data

    received_name = request.args.get('state')

    cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
                 'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
                 'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
                 'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
                 'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
                 'percent_no_highschool_diploma_score','education_avg_score','final_score']
    # cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
    #              'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
    #              'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
    #              'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
    #              'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
    #              'percent_no_highschool_diploma_score','education_avg_score','final_score', 'total_population', 'life_expectancy',
    #              'percent_frequent_physical_distress', 'percent_adults_with_obesity', 'percent_frequent_mental_distress', 
    #              'percent_insufficient_sleep', 'percent_homeowners', 'percent_below_poverty', 'percent_unemployed_CDC',
    #              'percent_severe_housing_cost_burden', 'percent_limited_access_to_healthy_foods']


    data_state = data[data['state'] == received_name]  

    numericalDF = data_state.drop(cols_to_remove, axis=1)  # Remove not required columns
    # Data Standardization

    X_std = StandardScaler().fit_transform(numericalDF)
    kmeans = KMeans(n_clusters= 2)
    kmeans.fit(X_std)
    cluster_values = kmeans.labels_
    #print(numericalDF.columns.tolist())

    # [, 'percent_fair_or_poor_health', , 'per_capita_income', 
    #  , 'percent_limited_access_to_healthy_foods', 
    #  , 'percent_no_highschool_diploma', 'high_school_graduation_rate', 'percent_vaccinated']

    my_df = pd.DataFrame(numericalDF, columns=numericalDF.columns.tolist())
    my_df['cluster'] = cluster_values
    pcp_data = my_df
    #print(pcp_data)
    state_pcp_data = json.dumps(pcp_data.to_dict(orient='records'), indent=2)
    state_pcp_data = {'pcpData': state_pcp_data}

    return jsonify(state_pcp_data = state_pcp_data)


@app.route('/countydataPCP')
def countydataPCP():
    global data

    state_name = request.args.get('state')
    received_name = request.args.get('county')

    #print(state_name, received_name)

    cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
                 'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
                 'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
                 'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
                 'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
                 'percent_no_highschool_diploma_score','education_avg_score','final_score']
    # cols_to_remove = ['state', 'county', 'percent_fair_or_poor_health_score','percent_frequent_physical_distress_score',
    #              'percent_adults_with_obesity_score','percent_frequent_mental_distress_score','percent_insufficient_sleep_score',
    #              'health_score','percent_limited_access_to_healthy_foods_score','percent_severe_housing_cost_burden_score',
    #              'qol_score','per_capita_income_score','percent_homeowners_score','percent_below_poverty_score',
    #              'percent_unemployed_CDC_score','wealth_avg_score','high_school_graduation_rate_score',
    #              'percent_no_highschool_diploma_score','education_avg_score','final_score', 'total_population', 'life_expectancy',
    #              'percent_frequent_physical_distress', 'percent_adults_with_obesity', 'percent_frequent_mental_distress', 
    #              'percent_insufficient_sleep', 'percent_homeowners', 'percent_below_poverty', 'percent_unemployed_CDC',
    #              'percent_severe_housing_cost_burden', 'percent_limited_access_to_healthy_foods']


    data_state = data[data['state'] == state_name]  

    data_county = data_state[data_state['county'] == received_name]  

    numericalDF = data_county.drop(cols_to_remove, axis=1)  # Remove not required columns
    # Data Standardization

    print(numericalDF)

    X_std = StandardScaler().fit_transform(numericalDF)
    #kmeans = KMeans(n_clusters= 2)
    #kmeans.fit(X_std)
    #cluster_values = kmeans.labels_
    #print(numericalDF.columns.tolist())

    # [, 'percent_fair_or_poor_health', , 'per_capita_income', 
    #  , 'percent_limited_access_to_healthy_foods', 
    #  , 'percent_no_highschool_diploma', 'high_school_graduation_rate', 'percent_vaccinated']

    my_df = pd.DataFrame(numericalDF, columns=numericalDF.columns.tolist())
    my_df['cluster'] = [1]
    pcp_data = my_df
    #print(pcp_data)
    state_pcp_data = json.dumps(pcp_data.to_dict(orient='records'), indent=2)
    state_pcp_data = {'pcpData': state_pcp_data}

    return jsonify(state_pcp_data = state_pcp_data)



@app.route('/boxData')
def boxData():
    global data

    sorted_health_data = data.sort_values("health_score")
    sorted_qol_data = data.sort_values("qol_score")
    sorted_wealth_data = data.sort_values("wealth_avg_score")
    sorted_education_data = data.sort_values("education_avg_score")

    health_data = []
    qol_data = []
    wealth_data = []
    education_data = []


    for index, row in sorted_health_data.iterrows():
        health_data.append({row['county']:row['health_score']})

    for index, row in sorted_qol_data.iterrows():
        qol_data.append({row['county']:row['qol_score']})

    for index, row in sorted_wealth_data.iterrows():
        wealth_data.append({row['county']:row['wealth_avg_score']})

    for index, row in sorted_education_data.iterrows():
        education_data.append({row['county']:row['education_avg_score']})


    return jsonify(health = health_data, qol = qol_data, wealth = wealth_data, education = education_data)

@app.route('/boxDataState')
def boxDataState():
    global data

    received_name = request.args.get('state')
    data_state = data[data['state'] == received_name] 

    sorted_health_data = data_state.sort_values("health_score")
    sorted_qol_data = data_state.sort_values("qol_score")
    sorted_wealth_data = data_state.sort_values("wealth_avg_score")
    sorted_education_data = data_state.sort_values("education_avg_score")

    health_data = []
    qol_data = []
    wealth_data = []
    education_data = []


    for index, row in sorted_health_data.iterrows():
        health_data.append({row['county']:row['health_score']})

    for index, row in sorted_qol_data.iterrows():
        qol_data.append({row['county']:row['qol_score']})

    for index, row in sorted_wealth_data.iterrows():
        wealth_data.append({row['county']:row['wealth_avg_score']})

    for index, row in sorted_education_data.iterrows():
        education_data.append({row['county']:row['education_avg_score']})


    return jsonify(health = health_data, qol = qol_data, wealth = wealth_data, education = education_data)




@app.route("/")
def index():
    return render_template("index.html")

if __name__=="__main__":
    print("Hello")
    app.run(host='0.0.0.0', port=8080, debug=True)
    app.config['TEMPLATES_AUTO_RELOAD'] = True