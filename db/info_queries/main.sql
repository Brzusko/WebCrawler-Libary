CREATE TABLE IF NOT EXISTS tx_ksskiconditionswide_domain_model_skicondition (

 

            uid int(11) NOT NULL auto_increment,

            pid int(11) DEFAULT '0' NOT NULL,
 
            on_name varchar(255) DEFAULT '' NOT NULL,

            town varchar(255) DEFAULT '' NOT NULL,

            open int(11) DEFAULT '0' NOT NULL,

            weather int(11) DEFAULT '0' NOT NULL,
            ski_condition int(11) DEFAULT '0' NOT NULL,

            open_lift varchar(255) DEFAULT '' NOT NULL,

            snow_min varchar(255) DEFAULT '' NOT NULL,

            snow_max varchar(255) DEFAULT '' NOT NULL,

            temp_min varchar(255) DEFAULT '' NOT NULL,

            temp_max varchar(255) DEFAULT '' NOT NULL,

            communique text NOT NULL,

            wind varchar(255) DEFAULT '' NOT NULL,

            id_country varchar(255) DEFAULT '' NOT NULL,

            name_id varchar(255) DEFAULT '' NOT NULL,

            wyciagi text NOT NULL,

            trasy text NOT NULL,

 

            tstamp int(11) unsigned DEFAULT '0' NOT NULL,

            crdate int(11) unsigned DEFAULT '0' NOT NULL,

            cruser_id int(11) unsigned DEFAULT '0' NOT NULL,

            deleted tinyint(4) unsigned DEFAULT '0' NOT NULL,

            hidden tinyint(4) unsigned DEFAULT '0' NOT NULL,

            starttime int(11) unsigned DEFAULT '0' NOT NULL,

            endtime int(11) unsigned DEFAULT '0' NOT NULL,

 

            t3ver_oid int(11) DEFAULT '0' NOT NULL,

            t3ver_id int(11) DEFAULT '0' NOT NULL,

            t3ver_wsid int(11) DEFAULT '0' NOT NULL,

            t3ver_label varchar(255) DEFAULT '' NOT NULL,

            t3ver_state tinyint(4) DEFAULT '0' NOT NULL,

            t3ver_stage int(11) DEFAULT '0' NOT NULL,

            t3ver_count int(11) DEFAULT '0' NOT NULL,

            t3ver_tstamp int(11) DEFAULT '0' NOT NULL,

            t3ver_move_id int(11) DEFAULT '0' NOT NULL,

 

            sys_language_uid int(11) DEFAULT '0' NOT NULL,

            l10n_parent int(11) DEFAULT '0' NOT NULL,

            l10n_diffsource mediumblob,

 

            PRIMARY KEY (uid),

            KEY parent (pid),

            KEY t3ver_oid (t3ver_oid,t3ver_wsid),

            KEY language (l10n_parent,sys_language_uid)

);