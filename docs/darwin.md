## Classes

<dl>
<dt><a href="#Darwin">Darwin</a></dt>
<dd><p>a service for connecting and communicating with the National Rail Darwin PushPort server</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#replaceKeys">replaceKeys(jsonObj)</a> ⇒ <code>object</code></dt>
<dd></dd>
</dl>

<a name="Darwin"></a>

## Darwin
a service for connecting and communicating with the National Rail Darwin PushPort server

**Kind**: global class  

* [Darwin](#Darwin)
    * _instance_
        * ["trainStatus"](#Darwin+event_trainStatus)
        * ["schedule"](#Darwin+event_schedule)
        * ["association"](#Darwin+event_association)
        * ["trainOrder"](#Darwin+event_trainOrder)
        * ["stationMessage"](#Darwin+event_stationMessage)
    * _inner_
        * [~connect(queue)](#Darwin..connect)

<a name="Darwin+event_trainStatus"></a>

### "trainStatus"
**Kind**: event emitted by <code>[Darwin](#Darwin)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ts | <code>string</code> | a timestamp of when the event was issued |
| trainStatus | <code>TrainStatus</code> | a train status class |
| origin | <code>string</code> | where the event originated from |

<a name="Darwin+event_schedule"></a>

### "schedule"
**Kind**: event emitted by <code>[Darwin](#Darwin)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | an id for the event |
| ts | <code>string</code> | a timestamp of when the event was issued |
| schedule | <code>Schedule</code> | a schedule class |
| origin | <code>string</code> | where the event originated from |
| source | <code>string</code> | which source did the vent originate from |

<a name="Darwin+event_association"></a>

### "association"
**Kind**: event emitted by <code>[Darwin](#Darwin)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | an id for the event |
| ts | <code>string</code> | a timestamp of when the event was issued |
| association | <code>Association</code> | a association class |
| origin | <code>string</code> | where the event originated from |
| source | <code>string</code> | which source did the vent originate from |

<a name="Darwin+event_trainOrder"></a>

### "trainOrder"
**Kind**: event emitted by <code>[Darwin](#Darwin)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | an id for the event |
| ts | <code>string</code> | a timestamp of when the event was issued |
| trainOrder | <code>TrainOrder</code> | a TrainOrder class |
| origin | <code>string</code> | where the event originated from |
| source | <code>string</code> | which source did the vent originate from |

<a name="Darwin+event_stationMessage"></a>

### "stationMessage"
**Kind**: event emitted by <code>[Darwin](#Darwin)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ts | <code>string</code> | a timestamp of when the event was issued |
| stationMessage | <code>StationMessage</code> | a StationMessage class |
| origin | <code>string</code> | where the event originated from |

<a name="Darwin..connect"></a>

### Darwin~connect(queue)
connects to the Darwin server and subscribes to a specified queue

**Kind**: inner method of <code>[Darwin](#Darwin)</code>  
**Emits**: <code>[trainStatus](#Darwin+event_trainStatus)</code>, <code>[schedule](#Darwin+event_schedule)</code>, <code>[association](#Darwin+event_association)</code>, <code>[trainOrder](#Darwin+event_trainOrder)</code>, <code>[stationMessage](#Darwin+event_stationMessage)</code>  

| Param | Type | Description |
| --- | --- | --- |
| queue | <code>string</code> | the queue to subscribe to |

<a name="replaceKeys"></a>

## replaceKeys(jsonObj) ⇒ <code>object</code>
**Kind**: global function  
**Returns**: <code>object</code> - An object with 'ns0:' tags removed from key names and some renamed.  

| Param | Type |
| --- | --- |
| jsonObj | <code>object</code> | 

